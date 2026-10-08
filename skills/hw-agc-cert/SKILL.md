---
name: hw-agc-cert
description: AGC调测证书自动申请，满额自动滚动删最老。触发：申请AGC证书/调测证书/证书名额。
version: 1.0
author: lantianhcgp + hermes-agent
license: MIT
metadata:
  hermes:
    tags: [huawei, agc, certificate, harmonyos]
    related_skills: [harmonyos-watch-ci]
---

# AGC 调测证书自动申请 —— 把「唯一人肉步骤」压到一次登录

## When to Use

- 申请/续期华为 AGC 调测证书，或**全自动生成 `.p7b`**（`certs/app.p7b` 签名材料）
- 查询证书名额、清单，或遇到「证书满了/要删证书」

## 状态（2026-10-08 实测闭环）

两次端到端独立跑通（仅凭本地会话文件，无人工、无浏览器介入）：

```
POST cert → 200 满额(3/3) → 自动删最老 → POST cert → 200 ret.code=0 → 新证书生成
```

同日 **p7b 全链闭环**（项目→应用→证书→设备→Provision→下载→公钥校验），
`.p7b` 不再需要手动下载：

```bash
python3 agc_cert.py p7b --base <基础名> --app-name <名> --udid <设备>
# 设备从账号设备库复用已注册设备；缺设备报 205389973 "no device provided"
```

## 架构

| 层 | 实现 |
|---|---|
| 工具仓 | `lantianhcgp/hw-agc-cert`（私有；零第三方依赖 Python urllib + Node CDP） |
| 登录 | proot Alpine 无头 Chromium（CDP 9222）+ 远程视界 `http://127.0.0.1:8777`（手机浏览器实时画面操作，用户亲手登录） |
| 会话 | cookie + X-HD-CSRF + agcTeamId 三元组 → `session.json`(chmod 600) |
| 自动化 | 登录自动侦测（3s 轮询 cookie，导出无需通知）；API 401/403 自愈（现场重导重试一次） |
| 运维 | 一键重启 `bash start_login_ui.sh`；会话失效时 API 自愈失败才报错，届时重登一次即可（不做定时探活） |

## 核心命令

```bash
cd ~/hw_watch/agc-cert
python3 agc_cert.py login-status    # 探活（401/403 自动自愈）
python3 agc_cert.py list            # 名额与清单
python3 agc_cert.py apply --name $(date +%Y%m%d%H%M%S)   # 一条龙申新
python3 agc_cert.py new-bundle <基础名> [--fresh]         # 随机包名防覆盖
```

## HTTP 规范（netcap 抓控制台实锤，勿改）

- 基址 `https://agc-drcn.developer.huawei.com/agc/edge`
- 6 头：`Cookie`（全 huawei 域）/ `X-HD-CSRF`（取自 HttpOnly cookie `csrfToken`——页面 JS 读不到，
  必须 CDP `Network.getAllCookies`）/ `agcTeamId`（登录后由 `user-team-list` 接口下发，随会话导出）
  / `Origin` / `Referer` = developer.huawei.com / `Content-Type`
- 端点：
  - `POST /cps/harmony-cert-manage/v1/cert/list` —— 名额/清单
  - `POST /cps/harmony-cert-manage/v1/cert {csr, certName, certType:1}` —— 申请
  - `DELETE /cps/harmony-cert-manage/v1/cert {certIds:[id]}` —— 删除（DELETE 带 JSON 体）
  - `POST /cpms/project-management-service/v1/projectList`（appList 内嵌）、
    `POST /cpms/project-management-service/v1/projects`、`POST /amis/app-manage/v1/app` —— 项目/应用
  - `POST /cps/device-manage/v1/device/list`、`POST /cps/device-manage/v1/device` —— 设备（Provision 必绑）
  - `GET /cps/provision-manage/v1/provision/list?packageName=…`、
    `POST|PUT /cps/provision-manage/v1/provision`、`POST …/provision/refresh` —— 档案（取 `provisionFileUrl` 下载）

## 策略与坑

- **名额 3/3**，满时 HTTP 仍是 200，业务码在 `ret.code`：`205389872` = exceeds limit
- **滚动策略**：满 → 自动删 `allowDel≠0` 里 expireTime 最早的 → 重申，循环（工具已固化）
- 登录控件是 `span#hwid-login-btn` 非 `<button>`；短信验证码有服务端频控
- CSR/私钥本地生成（P-256），私钥不出本机
- `publicKeySha256` 字段编码口径未明（16 种哈希不匹配），不影响申请；.cer 无下载端点
  （建档只用证书 id）
- 校验 `.p7b`：证书在内容 JSON 的 `development-certificate`（PEM、`\n` 转义），
  `openssl pkcs7 -print_certs` 只能看到签名链 3 张，**不能**用它判断证书是否配对

## 安全红线

- `session.json` / `key.pem` / `request.csr` / 浏览器 profile：**永不入 git、不进公开文档**
- 华为账号密码、短信验证码：不落盘，只在页面中由用户手输
- 本 skill 为公开仓文档：不含 team id、证书 id、cookie 等账号标识

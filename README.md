# lite-watch-starter

**Agent-ready 的 HarmonyOS Lite Wearable（华为轻智能手表）应用 + 一键构建签名流水线。**

内含两个真实可用的应用（课程表 elcton、日历 clan）和一条 push 即出 `.hap` 的
GitHub Actions 链。设计目标：**人类只做两件事（签证书、装表），开发-构建-签名-交付
全流程由 AI Agent 闭环完成**——本 README 同时写给新手和 Agent。

- 目标真机：华为 WATCH FIT3（方屏 408x480，Lite Wearable / faMode，API 10 档）
- 技术栈：HML + CSS + JavaScript（JerryScript Lite ES6 子集），零第三方依赖
- 状态：双应用 CI 全绿、真机安装验证通过（2026-10）

---

## 一、新手上手流程（人类视角，7 步）

1. **Fork 本仓库**（或直接 push 到你自己的仓库，public/private 皆可）
2. **拿一份调试证书**（一次性，约 10 分钟）：
   - 打开 [hap-sign-utils 网站](https://github.com/kqakqakqa/hap-sign-utils)，下载页内 `default.csr`
   - 到 [AGC 控制台](https://developer.huawei.com/consumer/cn/service/josp/agc/index.html)
     创建应用（名字随意）→ 用该 CSR 签发调试证书 → 下载 `.p7b`
   - 放到仓库 `certs/app.p7b`，commit + push（**这是全链唯一必须人做的事**）
3. **push 代码触发 CI**（改不改都行，先空跑一次验证链路）
4. 等 Actions 变绿（首次约 5 分钟，之后有缓存更快）→ 进 run 的 **Artifacts** 下载
   `elcton-<run>` / `clan-<run>`，里面是 `*-unsigned.app` + **签名好的 `.hap`**
5. 把 `.hap` 传到手机（微信/文件管理器均可），通过**华为穿戴 App → 应用管理**安装到手表
6. 装不上？看 `报错码 → 解法` 表（见第五节），把错误码发给你的 Agent
7. 日常迭代：改代码 → push → 等绿 → 下载 .hap → 安装，**不需要任何本地环境**

> ⚠️ 同一个证书 = 同一个应用身份，**同名安装会覆盖手表上已装应用的数据**。
> 不想覆盖，就换一份新证书（新身份=新应用）。

---

## 二、给 Agent 的操作手册（核心）

**读完本节即可接管这个仓库，无需其他上下文。**

### 0. 先加载技能包（仓库自带，无需安装）

```
skills/harmonyos-watch-ci/SKILL.md              # 本流水线全攻略：链路/关键决策/交付环/坑
skills/huawei-lite-watch-development/SKILL.md    # Lite Wearable 开发规范（上游 MIT）
  └─ references/install-error-codes.md           # 报错码总表 23/27/28/30/40/47/82 + 注解
  └─ references/build-install-error-catalog.md   # 五颗 40 号雷的实战实录 + diff 排查法
```

若你的运行环境支持 skill 目录（如 Hermes），直接把 `skills/` 下两目录复制进
`~/.hermes/skills/` 即可被索引；否则按普通文档阅读。

### 1. 代码在哪动

| 想改什么 | 位置 |
|---|---|
| 课程表（页面/数据/逻辑） | `entry/src/main/js/MainAbility/`（仓库根的 elcton 工程） |
| 日历 | `clan/entry/src/main/js/MainAbility/` |
| 默认课程种子数据 | `entry/src/main/resources/rawfile/default-schedule.json`（demo 数据，可直接换） |
| 构建后 config 清洗规则 | `scripts/clean_config_in_app.py` |
| 签名行为 | `tools/sign/sign-app-to-hap.js`（勿改逻辑，见 4 决策） |

工程形态硬约束（改 UI/逻辑前先看 skill）：`.js` 只用 Lite ES6 子集、`.hml` 表达式保持 ES5、
CSS 不支持 `flex-grow`/`position:fixed`/`font-weight`、单 JS 页 ≤48KB、512KB heap。

### 2. 触发构建与轮询

```bash
git add -A && git commit -m "feat: ..." && git push origin master
# 轮询（15s 间隔，最多 ~25 分钟；禁止长阻塞 sleep）
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/<owner>/<repo>/actions/runs?per_page=5" \
| python3 -c "import sys,json;[print(r['status'],r['conclusion'],r['id']) for r in json.load(sys.stdin)['workflow_runs'][:3]]"
```

### 3. 取产物并校验（交付前必做）

```bash
# artifact 下载必须 curl -L（302 到对象存储，别用裸 urllib）；字段是 size_in_bytes 不是 size
curl -sL -H "Authorization: token $GITHUB_TOKEN" -o app.zip \
  "https://api.github.com/repos/<owner>/<repo>/actions/artifacts/<id>/zip"
```

对 `.hap` 做两条断言再交付：

1. **一致性**：signed.bin 头（`0xBE` + int32BE 长度 + bundleName）== 内嵌 config 的
   `bundleName`（不一致 = 报错码 28）
2. **profile**：`compatible==40000010`、`target==60101024`、`deviceConfig=={}`、
   `version.code==0`（任一不符先查 skill 的实录再交付）

### 4. 四条不可随意改的决策

1. **CLT 版本 = 6.1.1.280**（工程 modelVersion；升 26.x 老形态可能不兼容）
2. **清洗步不可删**（hvigor 会注入 schema 非法字段 → 装表报 40）
3. **`FORCE_P7B_BUNDLE=1` 保持开启**（config 包名 ← 证书包名，满足错误码 28 的一致性；
   同时保证身份唯一、不覆盖用户现役应用）
4. **签名材料只进 `certs/`**，绝不进 `resources/`（会打进应用包）

### 5. 报错闭环

1. 拿到**数字错误码** → 查 `skills/huawei-lite-watch-development/references/install-error-codes.md`
2. 是 **40** → 执行黄金排查法：**失败包 vs 用户已装成功包做 config.json 全字段 diff**，
   差异即病灶（历史踩过的五颗雷全部记录在 `build-install-error-catalog.md`，先对照）
3. 是 **28/31/30** → 查签名一致性/重签（第三节断言 1）
4. 修代码或清洗规则 → 回到第 2 节循环；**不要**让用户反复手工重试同一包

### 6. 人类仅有的两个介入点

- **AGC 签发证书**（`certs/app.p7b`，约一年有效，过期/丢失才需要重来）
- **真机安装**（Agent 无 hdc 通道，经用户手机 → 手表）

其余（改码、构建、签名、校验、交付）全部 Agent 自治。装表结果由用户回报错误码或截图。

---

## 三、仓库结构

```
├── entry/                     # elcton 课程表主工程（仓库根）
├── clan/                      # 日历工程（独立 DevEco 工程）
├── scripts/clean_config_in_app.py   # config.json 五类清洗（就地改 .app）
├── tools/sign/                # 纯 JS HAP 签名器（源自 kqakqakqa/hap-sign-utils, MIT）
├── certs/                     # 证书占位（实体不入库，见 certs/README.md）
├── skills/                    # ★ Agent 技能包（见第二节）
├── docs/                      # 补充文档
└── .github/workflows/build.yml      # 双工程矩阵 CI
```

## 四、关键决策表（改动前必读）

| 决策 | 原因 |
|---|---|
| CLT 固定 6.1.1.280 | = 工程 modelVersion，faMode 老工程形态 |
| 构建后强制清洗 config | hvigor 注入非法字段 → 报错码 40 |
| `compatible = 4.0.0(10)` | FIT3 支持的老 API 档位；写新了报 40 |
| `deviceConfig = {}` | debug 构建注入的 `default.debug` 必须剥离 |
| 签名包名 = config 包名 | 错误码 28 硬性要求 |
| icon ≤48/32、label ≤22 字符 | 否则报错码 40 |

## 五、排错资源

- **报错码总表**：[`skills/huawei-lite-watch-development/references/install-error-codes.md`](skills/huawei-lite-watch-development/references/install-error-codes.md)
- **实战实录（五颗雷 + diff 方法论）**：同目录 `build-install-error-catalog.md`
- **流水线全攻略**：[`skills/harmonyos-watch-ci/SKILL.md`](skills/harmonyos-watch-ci/SKILL.md)

## 致谢与许可

- 签名方案：[kqakqakqa/hap-sign-utils](https://github.com/kqakqakqa/hap-sign-utils)
- 开发规范 skill：[AlanLinYu/huawei-lite-watch-development](https://github.com/AlanLinYu/huawei-lite-watch-development)（MIT）
- CI 工具链：[ErBWs/setup-ohos](https://github.com/ErBWs/setup-ohos)

本仓库代码以 [MIT License](LICENSE) 开源。

# 签名材料（一次性配置）

- `app.p7b`：AGC 下载的 provisioning profile（绑定 com.example.elcton）。
  获取：hap-sign-utils 网站下载 `default.csr` → AGC 控制台使用该 CSR → 下载 p7b 改名放这里。
- CI 检测到本文件存在即自动签名出 `.hap`；不存在则只出未签名 `.app`。

注意：不要把 `.p12` 私钥放进 `resources/`（会打进应用包）。

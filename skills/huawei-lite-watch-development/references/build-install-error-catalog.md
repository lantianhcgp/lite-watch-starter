# 构建/安装错误实录（FIT3 真机踩坑）

来源：2026-08 elcton（课程表）/ clan（日历）项目的 Codex 开发会话与真机安装反馈。
按报错文案检索；每条含根因与已验证解法。CI 化（GitHub Actions hvigor 构建）时同样适用。

## 安装类

### 「配置文件格式错误」但签名明明没问题
90% 的情况是**包其实是未签名的**——手表拒绝 unsigned .app 时报的就是这句误导性文案。
先查产物是否真签名，再怀疑格式。

### 46.配置文件 module.abilities.permissions 字段不合法
根因：`config.json` 里把 `reqPermissions` 放在了 `module` 级。FA 模型 Lite Wearable 不接受该字段格式。
解法：**删掉 reqPermissions**。Lite 上振动等是系统级权限，无需在 config.json 声明。

### 40.配置文件格式错误 / compileSDK 配置问题（复合根因）
三个独立问题叠加，逐项核对：

1. `build-profile.json5` 必须显式携带 `"compileSdkVersion": "6.1.1(24)"`（**字符串格式**，带括号 API 号）。
2. hvigor 打包时往 `config.json` 注入了 schema 非法字段：`appEnvironments`、
   `app.apiVersion.compileSdkVersion`、`app.apiVersion.compileSdkType`。
   安装时按 `configSchema_lite.json` 校验：`app` 只允许
   `bundleName/vendor/version/apiVersion/smartWindowSize/smartWindowDeviceType`，
   `apiVersion` 只允许 `compatible/target/releaseType`。
   当时的解法是 patch DevEco 的 hvigor 插件 `legacy-merge-profile.js`（写 config.json 前删字段）。
   **CI 上需等效处理**：构建后跑清洗脚本改 `.app` 内 `config.json`，或对 CLT 里的同名插件打补丁。
3. `module.package` 默认值 `com.example.myapplication` 必须改成真实包名；
   另注意 config.json 的 **UTF-8 BOM** 会导致解析失败，去掉。

4. **`deviceConfig.default.debug`（debug 构建注入，第 4 号雷）**：hvigor `-p buildMode=debug`
   注入 `deviceConfig.default.debug: true`；与已装成功包全字段 diff 发现成功包此处是空
   `deviceConfig: {}`。清洗删除该字段并把 `default` 收敛为空 → 形态对齐成功包。
5. **`app.apiVersion.compatible` 必须用目标机支持的老 API（第 5 号雷）**：
   FIT3 实测可装 profile = `compatible 40000010 (4.0.0(10))`、`target 60101024`；
   clan 曾因 build-profile `compatibleSdkVersion: "6.1.1(24)"`（packed=60101024）报 40——
   **SDK 新 ≠ 能装，按真机支持的老 API 写 compatible**。修法：改 `"4.0.0(10)"`。
6. **40 排查方法论**：失败包 vs **已装成功包**做 config.json 全字段 diff，差异即病灶
   （第 4、5 号雷由此定位；Codex 2026-08 只修过前三号，clan 的 40 当时从未修通，
   三次重写后搁置——所以"按当时修法再修一遍"不够用）。

### label 过长（>22 字符）
`string.json` 的 `MainAbility_label` 超 22 字符被拒 → 改短中文名（实测用「课程表」3 字符通过）。

### 应用图标太大
`icon.png` 104x104 被拒 → **48x48**；`icon_small.png` 92x92 → **32x32**（实测通过）。

## 签名类

- `debug.p7b` **不是** DevEco Studio「Signing Configs」用的 provisioning profile，两者别混。
- clan 工程持有全套调试材料：项目根 `debugKeyStore.p12/.csr`、`calendar.csr`，
  以及 `entry/src/main/resources/rawfile/debug.cer|p12|p7b`（注意：rawfile 里的 p12 会**打进应用包**，见审查清单）。
- hap-sign-utils 网站签名时曾报 `config.json 解析失败: hapLoad.file(..) is null`——
  `.app` 内 `.hap` 结构差异（FA lite 的 config.json 位置）导致。CI 复用 `sign-app-to-hap.js`
  若复现此错，先解包核对 `.hap` 内 `config.json` 的实际路径再改脚本取值逻辑。

## CSS/JS 兼容（项目内真实踩过）

- Lite 不支持的 CSS：`flex-grow`、`position: fixed`、`font-weight` → 全部移除。
- `@system.*` import 曾导致**整个模块加载失败**（模拟器实测）——不可用 API 必须隔离验证，
  不要让一个 import 拖垮整页。
- HML 表达式保持 ES5、`.js` 用 Lite ES6 子集——详见 jerryscript-syntax.md / hml-lite-syntax.md。

## elcton 项目基线（已修正状态，迁移/复刻时对照）

- `build-profile.json5`：`compileSdkVersion/targetSdkVersion = "6.1.1(24)"`、
  `compatibleSdkVersion = "4.0.0(10)"`、`runtimeOS: HarmonyOS`、`signingConfigs: []`、
  `products[0].signingConfig: "default"`（未签名构建可出 `*-unsigned.app`）。
- `config.json`：`deviceType: ["liteWearable"]`、无 reqPermissions、
  `bundleName: com.example.elcton`（占位）——**真实包名 `com.example.elcton`、appid <你的AGC应用ID>**，
  最终安装包的 bundleName 由 p7b 覆写（sign-app-to-hap.js 会做 `config.app.bundleName = p7b的`）。
- 目标设备：FIT3 方屏，物理 408x480 / 适配 336x396 / 512KB heap / API 24。
- 已知构建产物形态：`build/outputs/default/<name>-default-unsigned.app`（CI 应归档此路径）。

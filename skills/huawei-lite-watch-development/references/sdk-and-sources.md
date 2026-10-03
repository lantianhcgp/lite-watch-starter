# SDK、资料与案例工程索引

## 目录

- [定位 SDK](#定位-sdk)
- [查询 SDK](#查询-sdk)
- [官方资料](#官方资料)
- [案例工程](#案例工程)
- [查询策略](#查询策略)

## 定位 SDK

不要写死作者电脑上的盘符。优先按以下顺序确定当前项目使用的 DevEco/OpenHarmony SDK：

1. 用户明确提供的 SDK 根目录。
2. 项目、DevEco Studio 设置或环境变量记录的 SDK。
3. 用户本机安装目录中的 `default/openharmony/js` 结构。

记录 SDK 产品版本、API 版本和构建工具版本。若找不到 SDK，停止做确定的 API/组件兼容声明，并要求用户提供路径。

常用相对位置：

```text
<DevEco-SDK>/default/openharmony/js/api
<DevEco-SDK>/default/openharmony/previewer/liteWearable/bin/Simulator.exe
<DevEco-SDK>/default/openharmony/js/build-tools/ace-loader/webpack.lite.config.js
<DevEco-SDK>/default/openharmony/js/build-tools/ace-loader/babel.config.js
<DevEco-SDK>/default/openharmony/js/build-tools/ace-loader/lib/templater/lite_component_map.js
<DevEco-SDK>/default/openharmony/js/build-tools/ace-loader/lib/templater/component_validator.js
<DevEco-SDK>/default/openharmony/js/build-tools/ace-loader/bin/jerry.exe
```

## 查询 SDK

检查 webpack/Babel 目标、Lite 组件白名单和实际构建产物。`target: ['web', 'es5']` 之类配置只能证明构建链尝试转译，不能证明目标手表原生支持完整 ES6 或具备对应运行时内建对象。

```powershell
rg -n "接口名|@since|@deprecated|@syscap" "<DevEco-SDK>\default\openharmony\js\api"
rg -n "liteWearableTag|liteCommonTag" "<DevEco-SDK>\default\openharmony\js\build-tools\ace-loader"
```

## 官方资料

本公开仓库不再分发厂商原始文档、SDK 文件、设备截图或第三方案例指南。让用户从合法渠道提供或访问：

- 华为官方 [ArkUI JS 完整组件参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkui-js-full-comp)，用于查组件细节；仍需用 Lite SDK 白名单过滤。
- 当前版本 Lite Wearable 开发文档。
- 对应 API 版本的 `@system.*` / `@ohos.*` 声明。
- 目标设备、固件和 WearEngine 信息。
- 需要复现的真机日志与构建产物。

不得把本仓库的社区总结当成厂商保证。官方资料、SDK 和真机行为冲突时，记录冲突并以目标真机发布结果为准。

## 案例工程

案例工程只作为经验样本，不是规范本身。若用户提供工程目录：

- 优先选择目标 API、工程结构和设备档位相同的案例。
- 只读取 `entry/src/main` 或明确源码目录。
- 不从 `build`、`.preview`、解包产物反向覆盖源码。
- 音频案例重点检查 `config.json`、`app.js`、播放页面、`resources/rawfile/audio` 和 `loader_out_lite`。
- QuickJS/解释器实验只能作为兼容风险案例，不得直接作为产品方案。

## 查询策略

1. 从项目 `config.json` 确定 `liteWearable`、Ability 名和页面清单。
2. 从源码 import 确定实际模块。
3. 在当前 SDK `*.d.ts` 中查 `@since`、`@deprecated`、`@syscap`、权限及 Lite 注释。JS FA 工程优先核对实际 `@system.*` 默认导入，不把网页中的 ArkTS/kit 导入直接替换进去。
4. 在官方组件参考和用户合法提供的官方资料中查完整语义，再用 Lite 白名单、工程模型和设备行为缩小范围。
5. 在同类真机案例中寻找实现，但重新评估内存、资源和清理。
6. 若 SDK、资料和案例冲突，明确记录并以目标真机决定。

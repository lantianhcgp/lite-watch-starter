# 参考源码库（source-apps/）

第三方/社区收集的华为轻智能手表**成品应用源码**，供 AI 与开发者做实现参照
（页面结构、交互逻辑、config 形态）。**版权归各位原作者**，仅供学习参考；
若有侵权提 issue 即删。

## 机型规格矩阵（华为 Lite 手表）

`watch-model-matrix.md` + 原始截图 `watch-model-matrix-2026-08-16.jpg`（社区整理 by kqakqakqa，
2026.8.16）：全机型 分辨率/适配分辨率/代号/固件/最高 target+compatible/js heap/存储/WearEngine，
含 CI 用法（compatibleSdkVersion 上限怎么按机型选）与布局基准说明。做多机型适配先查它。

## 命名与系列约定

目录名格式：`<应用>-<系列>`。括号里的 **GT / FIT 是华为的不同手表系列**
（GT = 经典/商务系列，FIT = 方形运动系列），都属华为 HarmonyOS 体系，
但**屏幕形态与 API 档位不同**——参考布局、分辨率适配前，先确认目标系列。

**收录门槛**：只归档 `deviceType=liteWearable` 的工程（与本仓 Lite CI/装表工作流匹配）；
全智能 `wearable` 工程（WATCH 3/4 系、DevEco+HDC 安装的）不收——腕上日历2.7.7 即因此移除。

## 归档清单

| 目录 | 原始文件 | 系列 | 版本 | 构建体系 | 参考价值 |
|---|---|---|---|---|---|
| `Game2048-FIT3/` | 2048 v2.0.4(FIT3,4).zip | FIT3（方形 408x480） | 2.0.4 | **老 gradle hap 插件**（`com.huawei.ohos:hap:3.1.5.0`，compileSdkVersion 5/6）——与本仓库 hvigor 工程**不同代**，勿混用构建脚本 | 单页 2048 完整实现：触摸滑动、状态机、棋盘渲染（`entry/src/main/js/default/pages/index/`）；liteWearable config 样例 |
| `腕上词典-GT3-GT4/` | 腕上词典6.4.0(GT3+GT4).zip | GT3+GT4 双系列 | 6.4.0 | 老 gradle hap 插件（同 Game2048，勿混用构建脚本） | 12 页完整应用：词库分块加载（dic_*.bin 约 6MB）、中文输入法/键盘、搜索交互——大词库与输入法实现参考 |
| `腕上便条-FIT2/` | 腕上便条1.5.3-FIT2版 | FIT2 | 1.5.3 | 老 gradle hap 插件（同 Game2048，勿混用构建脚本） | 10 页完整应用：笔记存储、密码锁功能（settings 页 password 校验）、源码已剔除 build 产物（zip 内 2.7MB hap/bin 未归档） |
| `轻鸿蒙工具箱-GT3/` | 轻鸿蒙工具箱1.7.2(GT3) | GT3 | 1.7.2 | 老 gradle hap 插件 | 25 页大应用：工具箱类聚合功能（liteWearable），源码 243 文件——多页面组织与功能聚合参考 |
| `腕上词典-FIT3/` | 腕上词典6.4.0(FIT3)（移植作者@nxtei） | FIT3 | 6.4.0 | 老 gradle hap 插件 | GT3+GT4 版的 FIT3 移植（同 bundle 同版本），词库+中文输入法——**两版对照可看系列适配差异** |

## AI 使用指引

1. 看**业务实现**（`.js` 逻辑、`.hml` 结构、`.css` 布局、`config.json` 字段）——
   这些与构建体系无关，可直接对照本仓库工程改写
2. **不要**把它家的 `build.gradle` / gradle wrapper 搬进本仓库（本仓是 hvigor + CI 流水线）
3. 引用具体代码时注明来自该参考目录；改动本仓库时以 `skills/` 里的规范为准

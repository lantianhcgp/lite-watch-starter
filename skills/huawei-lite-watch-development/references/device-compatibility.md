# 设备兼容与内存档位

## 目录

- [全量矩阵（含原图）](#全量矩阵含原图)
- [使用规则](#使用规则)
- [CI 换算用法](#ci-换算用法)
- [已知 JS heap 档位](#已知-js-heap-档位)
- [屏幕与适配分辨率](#屏幕与适配分辨率)
- [API 观察](#api-观察)
- [不确定性](#不确定性)

## 全量矩阵（含原图）

原始截图：`watch-model-matrix-2026-08-16.jpg`（同目录；社区整理 by kqakqakqa，2026.8.16，
表尾附适配分辨率计算器 desmos 链接）。逐行全量转录（含代号/固件/deviceInfo/存储/WearEngine 列）
见本 skill 所在仓库的 `references/watch-model-matrix.md`（elcton / lite-watch-starter 双仓均有）。

本页保留三组浓缩视角（heap 档位、分辨率分组、API 观察）与审慎规则；查具体机型的
代号、固件、存储、WearEngine 版本 → 看全量矩阵。

## 使用规则

本表整理自社区提供的设备矩阵与实机经验，未附带原始截图。`?` 表示来源未确认；空白不得解释为“不受限”或“支持”。发布前以目标真机、当前固件和可合法访问的官方资料复核。

若目标型号未知，按 64 KB JS heap 档实现。若目标明确为 256 KB 或 512 KB，仍为框架、回调、解析峰值和错误路径保留余量。

## 已知 JS heap 档位

| 系列/型号 | 原表 JS heap | 处理方式 |
|---|---:|---|
| GT2 42mm、GT2 46mm、GT2e、GT2Pro、GT2ProECG、GS3、GSPro | 64 KB | 最低档，禁止常驻大型数据；作为跨代兼容默认基线 |
| GT3 42mm、GT3 46mm | 256 KB | 中档，仍需分片与有限缓存 |
| GT3 Pro 43mm、GT3 Pro 46mm | 512 KB | 高档，但不可假设所有 GT3 都为 512 KB |
| FIT3、FIT2 | 512 KB | 高档；仍需真机确认固件差异 |
| 较新 GT4/GT5/GT6、Runner2、Ultimate2、FIT4/D2 等 | 原图多为空白 | 用户说明常见为 512 KB，但型号/固件未逐项证实；按未知处理 |

图片渲染使用独立内存池，用户经验值约为十几 MB。该经验不是公开保证，也不表示可以无限预加载。

## 屏幕与适配分辨率

| 设备组 | 屏幕 | 物理分辨率 | 原表适配分辨率 |
|---|---|---:|---:|
| GT3/GT4/GT5/GT6、Runner/Ultimate 多数圆表 | 圆 | 466x466 | 336x306 |
| GT2 42mm | 圆 | 390x390 | 276x276 |
| GT2 46mm、GT2e、GT2Pro、GS3/GSPro | 圆 | 454x454 | 336x306 |
| FIT5 Pro、FIT5、FIT4 Pro、FIT4、FIT3 | 方 | 408x480 | 336x396 |
| FIT2 | 方 | 336x480 | 336x396 |
| D2 | 方 | 408x480 | 336x396 |
| D | 方 | 280x456 | 276x360 |

不要根据物理分辨率直接写死 UI。优先按适配分辨率布局，再核对对应物理像素素材。

## API 观察

- GT2 系列原图显示最高 target 常见为 API 6，compatible 常见为 API 3；GS3/GSPro 字段带不确定标记。
- GT3 系列原图显示 target/compatible 多为 API 7（带 `?`），`deviceInfo` 可能为 API 6（带 `?`）。
- GT4/GT5/GT6、FIT3/FIT4、D2 等较新设备原图多显示 target/compatible 为 API 10+，`deviceInfo` 观察值跨 API 11、12、20、21。
- FIT2、D 等较旧方表原图显示 target/compatible 多为 API 7（带 `?`）。
- “设备返回的 API 版本”“最高 target”“最高 compatible”不是同一字段，不能互相替代。

## CI 换算用法

- `build-profile.json5` 的 `compatibleSdkVersion`/`targetSdkVersion` 格式 `x.y.z(n)`，
  n = API 档位；**必须 ≤ 目标机型「最高 compatible」**（本表），否则装表报 40/47。
- **API10+ 档机型**（GT4/5/6、FIT3/4、D2、Runner2、Ultimate 系）：本仓实测可用
  `compatibleSdkVersion "4.0.0(10)"` + `targetSdkVersion "6.1.1(24)"`（elcton 仓 FIT3
  有效期内 Debug 证书装表成功 profile）；编译 SDK 可以新，兼容声明必须落在机型档位内。
- **老档机型**：GT3 系 API7?、GT2 系 API3、FIT2/D API7 —— `4.0.0(10)` 装不上，
  需换算更低版本串（未在本仓验证，先真机）。
- 报安装错误时连带记录「代号 + 固件版本」（本表可查），只报营销型号无法复现。

## 不确定性

- 原表含大量问号和空白，不能据此生成绝对兼容声明。
- 型号相似不代表 heap 相同，例如 GT3 与 GT3 Pro 已出现 256/512 KB 差异。
- 固件升级可能改变 `deviceInfo` 返回值、接口行为或构建目标，但不能假设会扩大物理内存。
- 发布矩阵应记录具体代号、固件和实测结果，不只记录营销型号。

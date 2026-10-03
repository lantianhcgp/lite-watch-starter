# Lite Wearable 传感器接口

本页是社区编写的开发索引，不替代目标 SDK 的 `@system.sensor.d.ts`、官方文档或真机测试。Lite Wearable JS FA 工程通常使用：

```js
import Sensor from '@system.sensor';
```

不要把面向 ArkTS/新模型的 `@kit.SensorServiceKit`、`@ohos.sensor` 示例直接粘贴到 JerryScript/HML 工程。即使新版声明把旧接口标成 deprecated，Lite Wearable 仍可能需要 `@system.sensor`；以工程 SDK、设备 API 和实测为准。

## 目录

- [共同规则](#共同规则)
- [接口总表](#接口总表)
- [频率与功耗](#频率与功耗)
- [生命周期范式](#生命周期范式)
- [权限和配置](#权限和配置)
- [逐项注意事项](#逐项注意事项)
- [验证清单](#验证清单)

## 共同规则

- 传感器能力从 API 3 起提供；设备方向和陀螺仪从 API 6 起提供。
- 所有接口都依赖手表实际硬件，仅在目标真机上才能形成有效结论。
- 同一应用重复订阅同一种传感器时，通常只有最后一次订阅生效。不要把它当作多监听器总线。
- 每个 `subscribeXxx` 必须有同名 `unsubscribeXxx`，并在离开使用场景时执行。至少在 `onDestroy` 清理；若页面隐藏后不需要数据，也在 `onHide` 停止并在 `onShow` 有条件恢复。
- 回调只保存 UI 真正需要的少量标量。不要在高频回调中持续创建对象、拼接日志、扩张数组或直接反复写 storage/file。
- `success` 是数据回调，可能执行很多次；`fail(data, code)` 记录失败但不能假设错误码跨设备完全一致。
- 订阅成功不等于数据可信。检查无数据、恒定值、异常值、坐标方向、单位和设备未佩戴状态。

## 接口总表

| 数据 | 订阅/查询 | 取消 | 最低 API | 回调字段 | 权限 | Lite Wearable 说明 |
| --- | --- | --- | ---: | --- | --- | --- |
| 加速度 | `subscribeAccelerometer` | `unsubscribeAccelerometer` | 3 | `x`, `y`, `z` | `ohos.permission.ACCELEROMETER` | 支持取决于硬件；权限在部分工具链中属于系统权限 |
| 罗盘 | `subscribeCompass` | `unsubscribeCompass` | 3 | `direction` | 无文档化应用权限 | 方向角度；需真机校准和验证 |
| 距离 | `subscribeProximity` | `unsubscribeProximity` | 3 | `distance` | 无文档化应用权限 | 官方设备差异说明：Lite Wearable 调用无效果，不应依赖 |
| 环境光 | `subscribeLight` | `unsubscribeLight` | 3 | `intensity` | 无文档化应用权限 | 官方设备差异说明：Lite Wearable 调用无效果，不应依赖 |
| 计步 | `subscribeStepCounter` | `unsubscribeStepCounter` | 3 | `steps` | `ohos.permission.ACTIVITY_MOTION` | 返回重启后累计步数，不是本次会话增量 |
| 气压 | `subscribeBarometer` | `unsubscribeBarometer` | 3 | `pressure` | 无文档化应用权限 | 本地声明与文档对单位存在差异，必须以目标版本和真机校验 |
| 心率 | `subscribeHeartRate` | `unsubscribeHeartRate` | 3 | `heartRate` | `ohos.permission.READ_HEALTH_DATA` | 默认约 5 秒一次；本地 SDK 声明指出 `255` 可表示无效值 |
| 佩戴状态 | `subscribeOnBodyState` | `unsubscribeOnBodyState` | 3 | `value` | 无文档化应用权限 | `true` 表示已佩戴；可结合心率有效性判断 |
| 当前佩戴状态 | `getOnBodyState` | 无 | 3 | `value` | 无文档化应用权限 | 单次异步查询，支持 `complete` |
| 设备方向 | `subscribeDeviceOrientation` | `unsubscribeDeviceOrientation` | 6 | `alpha`, `beta`, `gamma` | 无文档化应用权限 | 官方设备差异说明：Lite Wearable 调用无效果，不应依赖 |
| 陀螺仪 | `subscribeGyroscope` | `unsubscribeGyroscope` | 6 | `x`, `y`, `z` | `ohos.permission.GYROSCOPE` | 旋转角速度；权限在部分工具链中属于系统权限 |

“无文档化应用权限”只表示当前索引未列出额外权限，不表示任何固件上都无需权限。始终检查目标 SDK 声明和 `config.json`。

## 频率与功耗

只有加速度、设备方向和陀螺仪选项包含 `interval`：

| 值 | 典型间隔 | 用途 | 规则 |
| --- | ---: | --- | --- |
| `normal` | 约 200 ms | 普通交互、低功耗 | 默认首选 |
| `ui` | 约 60 ms | 需要较顺滑的 UI | 先节流 UI 更新再采用 |
| `game` | 约 20 ms | 动作识别或游戏 | 仅在确有算法需求、真机功耗和 heap 通过时使用 |

订阅频率不是渲染频率。传感器可以高频采样，但页面状态更新、日志和图片切换应节流。对 64 KB heap，优先复用模块级数字变量或固定长度环形缓冲区。

## 生命周期范式

下面使用 Lite 工程可接受的保守 JS 写法。权限、API 和设备能力检查应放在订阅之前。

```js
import Sensor from '@system.sensor';

let sensing = false;

export default {
  data: {
    ax: 0,
    ay: 0,
    az: 0
  },

  startSensor: function () {
    if (sensing) {
      return;
    }
    sensing = true;
    Sensor.subscribeAccelerometer({
      interval: 'normal',
      success: (ret) => {
        this.ax = ret.x;
        this.ay = ret.y;
        this.az = ret.z;
      },
      fail: (data, code) => {
        sensing = false;
        console.error('accelerometer failed: ' + code + ', ' + data);
      }
    });
  },

  stopSensor: function () {
    if (!sensing) {
      return;
    }
    Sensor.unsubscribeAccelerometer();
    sensing = false;
  },

  onDestroy: function () {
    this.stopSensor();
  }
};
```

箭头函数属于文档列出的 `.js` ES6 子集，并有利于保留页面 `this`；若旧构建链 helper 过重或目标真机不稳定，改为保存 `const page = this` 后使用普通函数。不要在 HML 表达式中使用箭头函数。

同时订阅加速度和陀螺仪时，分别维护状态并分别取消。API 低于 6 时不得调用陀螺仪；不能只给订阅加版本判断而无条件取消。

## 权限和配置

根据使用项在 Lite 模块的 `config.json` 中声明所需权限。不同 DevEco 版本的 JSON 结构可能不同，复制项目已有权限项的结构，不要凭空改成 Stage 模型配置。

| 能力 | 权限 |
| --- | --- |
| 加速度 | `ohos.permission.ACCELEROMETER` |
| 计步 | `ohos.permission.ACTIVITY_MOTION` |
| 心率 | `ohos.permission.READ_HEALTH_DATA` |
| 陀螺仪 | `ohos.permission.GYROSCOPE` |

部分权限可能是系统权限，第三方应用即使声明也未必获得。构建成功不能证明授权成功；把 `fail` 回调与真机授权结果记录在兼容矩阵中。

## 逐项注意事项

### 加速度与陀螺仪

- `x/y/z` 坐标方向、量纲和设备姿态关系以目标型号实测为准。
- 动作识别用时间窗和阈值时，固定窗口上限；不要无限记录历史样本。
- 旧设备可能只有加速度计。陀螺仪应作为能力增强，除非产品明确只支持 API 6+ 型号。

### 罗盘

- `direction` 是设备朝向角度。磁场干扰、佩戴姿势和校准会影响结果。
- UI 应容忍短时跳变，不要在每次回调重建整个页面。

### 计步

- `steps` 是累计值。会话步数应保存起始基线并计算非负差值。
- 设备重启或计数器复位后，当前值可能小于基线；此时重置基线，不要产生负步数。

### 心率与佩戴状态

- 心率回调默认约 5 秒一次，不适合动画帧驱动。
- 把 `255`、非正数、未佩戴时读数及设备特定哨兵值视为待过滤数据，不直接展示为有效心率。
- 健康数据属于敏感信息，只保留功能必需值，不写入无界日志。

### 气压计

- 字段为 `pressure`。当前资料存在 Pa 与 hPa 的单位表述差异，不在代码中硬编码换算结论。
- 在已知海拔/天气条件下观察数量级，并记录设备型号、固件、SDK 文档单位后再决定换算。

### Lite 无效果接口

`subscribeProximity`、`subscribeLight`、`subscribeDeviceOrientation` 在现有官方设备差异说明中标为 Lite Wearable 无效果。Skill 必须把它们标成不可依赖能力，而不是因为类型声明存在就放行。若某个特定新型号实测有效，把结果限定到该型号和固件。

## 验证清单

1. 在目标 SDK 的 `@system.sensor.d.ts` 中确认方法、`@since`、权限和 syscap。
2. 核对 `config.json` 权限与目标设备 API。
3. 验证订阅成功、稳定返回、字段范围、单位、坐标方向和异常值。
4. 反复进入/退出页面，确认没有重复订阅、后台回调或 heap 持续增长。
5. 对 `ui`/`game` 测试功耗、发热、掉帧和日志开销。
6. 记录模拟器仅用于流程冒烟；最终结论来自签名包和目标真机。

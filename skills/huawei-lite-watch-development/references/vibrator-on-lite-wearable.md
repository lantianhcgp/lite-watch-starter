# Lite Wearable 振动接口

Lite Wearable JS FA 工程使用：

```js
import vibrator from '@system.vibrator';
```

`vibrator.vibrate(options)` 从 API 3 起提供，依赖设备马达，只能在真机确认。新 SDK 可能将它标为 API 8 起 deprecated，但 Lite Wearable 旧工程不应在没有 SDK/syscap/真机证据时改用 `@ohos.vibrator` 或 ArkTS kit 导入。

## 参数

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `mode` | 否 | `'long'` 或 `'short'`；省略时通常为 `'long'` |
| `success` | 依目标声明 | 开始/完成触发的成功回调；为兼容本地声明建议提供 |
| `fail(data, code)` | 否 | 调用失败 |
| `complete` | 否 | 无论成功失败均结束时调用 |

需要在 Lite 模块配置中声明 `ohos.permission.VIBRATE`。部分系统权限或产品策略仍可能阻止第三方应用调用，必须处理 `fail`。

```js
import vibrator from '@system.vibrator';

export function vibrateShort() {
  vibrator.vibrate({
    mode: 'short',
    success: function () {},
    fail: function (data, code) {
      console.error('vibrate failed: ' + code + ', ' + data);
    }
  });
}
```

## 使用规则

- 用户设置允许关闭振动；不要每次渲染或传感器采样都振动。
- 点击防抖，避免快速连点形成连续马达请求。
- 心率、计步等后台回调不得默认触发振动。
- `short`/`long` 的实际时长、强度、并发调用行为和静音/勿扰模式影响按型号记录。
- API 没有通用的自定义波形、强度或取消能力时，不要伪造这些接口。
- 模拟器最多验证调用路径，不代表硬件振动、权限或功耗结果。

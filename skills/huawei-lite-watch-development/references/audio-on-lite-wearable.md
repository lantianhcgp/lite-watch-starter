# Lite Wearable 音频实现规范

## 目录

- [强制证据](#强制证据)
- [资源与权限](#资源与权限)
- [首次复制流程](#首次复制流程)
- [播放与切换](#播放与切换)
- [低开销实现骨架](#低开销实现骨架)
- [格式与资源控制](#格式与资源控制)
- [验证矩阵](#验证矩阵)

## 强制证据

若用户拥有 `shalu2` 案例工程，音频任务优先检查以下位置；该公开仓库不附带案例源码或原始指南：

- `entry/src/main/config.json`
- `entry/src/main/js/MainAbility/app.js`
- `entry/src/main/js/MainAbility/pages/game/game.js`
- `entry/src/main/resources/rawfile/audio/music/`
- `entry/src/main/resources/rawfile/audio/playList`
- `entry/src/main/resources/rawfile/audio/cur_playlist`
- `entry/build/default/intermediates/loader_out_lite/default/js/`

已观察的案例工程包含开发文档允许并由构建链处理的箭头函数、`const`、方法简写，以及电脑端 Node `get.js`。复用其音频架构和真机路径经验时，仍按 `jerryscript-syntax.md` 核对 Lite ES6 子集、构建产物和 heap；不得照搬 Node 工具或文档未列出的语法。

## 资源与权限

使用以下结构：

```text
entry/src/main/resources/rawfile/audio/
├── music/
│   ├── bgm.mp3
│   └── click.mp3
├── playList
└── cur_playlist
```

在 `config.json` 的模块中配置：

```json
"reqPermissions": [
  {
    "reason": "访问音频功能",
    "usedScene": { "when": "always" },
    "name": "ohos.permission.MODIFY_AUDIO_SETTINGS"
  }
]
```

`playList` 采用 `文件名,启用标志,保留字段,时长秒;`，例如 `bgm.mp3,1,0,120;click.mp3,1,0,1;`。`cur_playlist` 内容为 `playList`。保持文件名大小写与真实文件一致。

## 首次复制流程

`@system.audio` 在该工程中不能直接播放 rawfile 音频。采用：

```text
开发资源: resources/rawfile/audio/music/bgm.mp3
打包只读: internal://app/rawfile/audio/music/bgm.mp3
复制后播放: internal://app/music/bgm.mp3
```

首次启动：

1. 用 `file.access` 检查复制完成标记或目标文件。
2. 用 `file.list` 遍历 `internal://app/rawfile/audio`。
3. 用 `file.mkdir` 创建目标目录。
4. 逐个、顺序调用 `file.copy`，等待 `success/fail/complete` 后再处理下一项，避免并发回调占用 heap。
5. 只有全部文件复制成功并用 `file.access` 验证关键 MP3、`playList`、`cur_playlist` 后，才写完成标记或清理源目录。
6. 任一复制失败时保留可重试状态，不进入播放页，不把“目录不存在”直接等同于“复制成功”。

`shalu2` 的递归架构是依据，但不能复制“发起所有异步 copy 后立即 rmdir”的竞态。应补齐完成计数或顺序状态机。

## 播放与切换

- 导入 `audio from '@system.audio'`。
- 将 `audio.volume` 限制为 `0.0` 到 `1.0`；UI 的 0–100 值除以 100。
- 播放前执行 `audio.stop()`，再设置 `audio.src = 'internal://app/music/name.mp3'`，最后 `audio.play()`。
- 按单活动音源处理 `@system.audio`。BGM 与音效不并发：停止 BGM、播放音效、依据已知时长加少量余量后恢复 BGM。
- 缓存音效开关和音量；不要每次短音效都读取存储。
- 新音效到来时先清理旧的 BGM 恢复定时器，避免多个恢复任务争抢音源。
- 在页面 `onDestroy` 和应用 `onDestroy` 中停止音频；同时清除恢复定时器、动画同步定时器并恢复屏幕常亮设置。
- 退出、右滑、路由替换和异常路径都执行同一幂等清理函数。

## 低开销实现骨架

播放函数：

```javascript
import audio from '@system.audio';

function stopAudio() {
  try {
    audio.stop();
  } catch (error) {
    console.error('audio.stop failed: ' + error);
  }
}

function playFile(path, volume) {
  stopAudio();
  audio.volume = Math.max(0, Math.min(1, volume));
  audio.src = path;
  audio.play();
}
```

页面生命周期：

```javascript
export default {
  data: {
    restoreTimer: null
  },
  onShow: function() {
    playFile('internal://app/music/bgm.mp3', 0.5);
  },
  onDestroy: function() {
    if (this.restoreTimer) {
      clearTimeout(this.restoreTimer);
      this.restoreTimer = null;
    }
    stopAudio();
  }
};
```

文档允许在 `.js` 源码中使用箭头函数和 `const/let`，但此处异步回调较多，普通函数可减少对旧构建链和 helper 的依赖。Promise 与 `async/await` 不在 Lite ES6 语法白名单中；不要用于此流程。

## 格式与资源控制

- 优先真实 MP3。文件扩展名不能代替编码格式验证。
- MP3 文件头接受 `49 44 33`（ID3）或有效 MPEG 帧同步 `FF Ex`；出现 `ftyp` 通常是 M4A/MP4，必须转码。
- WAV 体积大；OGG 仅在目标真机验证后使用。不要把改后缀的 AAC/M4A 当 MP3。
- `shalu2` 指南建议 128/192 kbps、单文件不超过 5 MB、总音频资源不超过 50 MB；这些是经验上限，不是所有型号保证。对低存储设备采用更保守预算。
- `rawfile/audio/get.js` 依赖 Node `fs` 和 `audio-loader`，只能在电脑上生成播放列表；不要把它导入表端代码。发布包不需要时移出 rawfile，避免复制无关脚本。

## 验证矩阵

至少验证：

1. 完全卸载后的首次安装：复制进度、目录创建、文件校验和首次播放。
2. 第二次及后续启动：不重复复制、不误删、不跳过失败恢复。
3. 真 MP3、伪 MP3、文件缺失、空间不足和复制中断。
4. BGM 播放、连续短音效、快速切页、退出时播放、应用销毁。
5. 音量 0、0.5、1，以及越界 UI 输入的钳制。
6. 动画同步：动画时长、音效时长和恢复定时器一致；销毁后不再触发。
7. 最低 API/heap 真机。模拟器只能验证流程和 UI，不能证明解码器、音频焦点或退出清理。

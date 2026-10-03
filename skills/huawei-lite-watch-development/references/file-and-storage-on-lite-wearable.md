# Lite Wearable 文件与键值存储接口

本页覆盖 JerryScript/HML FA 工程中的 `@system.file` 与 `@system.storage`。两者都是回调式接口，不返回 Promise；不要使用 `await file.readText(...)`。

```js
import file from '@system.file';
import storage from '@system.storage';
```

## 目录

- [路径和能力边界](#路径和能力边界)
- [文件接口总表](#文件接口总表)
- [文件回调和错误](#文件回调和错误)
- [安全读写范式](#安全读写范式)
- [rawfile 复制流程](#rawfile-复制流程)
- [Storage 接口](#storage-接口)
- [低内存规则](#低内存规则)
- [模拟器和真机](#模拟器和真机)

## 路径和能力边界

| 路径 | 用途 | file API | 用户是否可见 | 是否可写 |
| --- | --- | --- | --- | --- |
| `/common/...` | HML/CSS 固定资源 | 不可用 | 否 | 否 |
| `internal://app/rawfile/...` | 打包原始文件 | 读取/复制行为需目标版本实测 | 随包进入真机目录 | 按只读处理 |
| `internal://app/...` | 应用私有运行时文件 | 可用 | 通常仅应用可见 | 可写 |

`common` 通常要由开发者创建在 `entry/src/main/js/<Ability>/common`。它不是 file API 目录。`rawfile` 位于 `entry/src/main/resources/rawfile`；所有图片和路径段都使用英文 ASCII 名称并保持大小写一致。

`@system.file` 从 API 3 起提供，并在新 SDK 中标记 API 10 起不再维护。Lite Wearable 旧 FA 工程不能因此自动迁移到 `@ohos.file.fs`；先确认目标工程模型、SDK syscap 和真机。URI 通常限制为最多 128 个字符，并禁用一组特殊字符；具体限制以目标 SDK 声明为准。路径保持简短，仅使用 ASCII 字母、数字、`_`、`-`、必要的 `/` 和扩展名。

## 文件接口总表

所有方法接收一个 options 对象，并可包含 `success`、`fail(data, code)`、`complete` 回调。

| 方法 | 必填参数 | 常用可选参数 | 成功数据 | 关键限制 |
| --- | --- | --- | --- | --- |
| `file.move` | `srcUri`, `dstUri` | 回调 | 目标 URI | 源存在；目标父目录先创建；不能把 rawfile 当可写源区 |
| `file.copy` | `srcUri`, `dstUri` | 回调 | 目标 URI | 目标父目录先创建；来源类型是否支持须实测 |
| `file.list` | `uri` | 回调 | `fileList` | 只列目标目录；每项含 `uri`, `lastModifiedTime`, `length`, `type` |
| `file.get` | `uri` | `recursive` | 文件/目录信息及可选 `subFiles` | 递归结果可能显著占用 heap |
| `file.delete` | `uri` | 回调 | 无 | 只能删文件，不能删应用资源路径 |
| `file.writeText` | `uri`, `text` | `encoding`, `append` | 无 | 文件不存在时创建；默认 UTF-8、覆盖写 |
| `file.writeArrayBuffer` | `uri`, `buffer` | `position`, `append` | 无 | `buffer` 为 `Uint8Array`；append 时 position 无效 |
| `file.readText` | `uri` | `encoding`, `position`, `length` | `{ text }` | 默认 UTF-8；默认长度 4096；资料列出超过 4 KB 可报 302 |
| `file.readArrayBuffer` | `uri` | `position`, `length` | `{ buffer }` | 不给 length 可能读到末尾，低 heap 下风险很高 |
| `file.access` | `uri` | 回调 | 无 | 存在走 success，不存在通常走 fail 301 |
| `file.mkdir` | `uri` | `recursive` | 无 | 默认不递归；本地 SDK 声明最多递归创建 5 层 |
| `file.rmdir` | `uri` | `recursive` | 无 | 默认只删空目录；`recursive: true` 是高风险破坏操作 |

常见错误码：`202` 参数错误、`300` I/O 错误、`301` 文件或目录不存在、`302` 文本读取超过接口限制。设备实现可能增加差异，必须保留 `fail`。

## 文件回调和错误

- 只有前一步 `success` 执行后才能开始依赖它的下一步。并排调用 `mkdir`、`copy`、`readText` 会形成竞态。
- `complete` 无论成功失败都会运行，只用于释放忙碌状态；不能在其中假设文件已写入。
- 用 `access` 区分“首次初始化”和“已有文件”，但不能把任意失败都当作不存在。检查 `code === 301`，其他错误要上报或重试。
- 目标写入若需要抗中断，先写临时文件，成功后再 move 到正式路径；是否能覆盖已有目标需在目标设备验证。
- 删除和递归删除前，校验 URI 是应用预期的固定前缀，禁止把外部输入直接传给 `delete`/`rmdir`。

## 安全读写范式

```js
import file from '@system.file';

const SAVE_DIR = 'internal://app/save';
const SAVE_FILE = 'internal://app/save/state.json';

function doWriteState(text, done) {
  file.writeText({
    uri: SAVE_FILE,
    text: text,
    encoding: 'UTF-8',
    append: false,
    success: function () {
      if (done) {
        done(true);
      }
    },
    fail: function (data, code) {
      console.error('write failed: ' + code + ', ' + data);
      if (done) {
        done(false);
      }
    }
  });
}

function writeState(text, done) {
  file.mkdir({
    uri: SAVE_DIR,
    recursive: true,
    success: function () {
      doWriteState(text, done);
    },
    fail: function (data, code) {
      // Some implementations report an existing directory as a failure.
      file.access({
        uri: SAVE_DIR,
        success: function () {
          doWriteState(text, done);
        },
        fail: function () {
          console.error('mkdir failed: ' + code + ', ' + data);
          if (done) {
            done(false);
          }
        }
      });
    }
  });
}
```

上例只把“创建或确认目录”执行一次，再进入写入函数，不做无限递归重试。对频繁保存使用去抖，避免每个传感器或滑块回调都写文件。

分片读取文本时显式设置 `position` 与 `length`。偏移量的字节/字符语义、UTF-8 多字节边界和是否允许读取任意二进制必须按目标 SDK 与真机验证；结构化数据优先拆成多个小文件，而不是依赖在多字节字符中任意切片。

## rawfile 复制流程

`rawfile` 是打包资源，按只读处理。音频等需要普通可写 URI 的资源采用：

1. `file.access` 检查最终目标是否已经存在。
2. `file.mkdir` 创建 `internal://app/music` 等目标目录。
3. 对每个资源调用 `file.copy`，源为 `internal://app/rawfile/...`，目标为 `internal://app/...`。
4. 每个 copy 的 `success` 增加完成计数，`fail` 记录具体文件。
5. 只有所有文件成功后才写入初始化标志或开始播放。
6. 不要在 copy 尚未回调时删除目录、启动播放器或标记完成。

目标 DevEco 版本可能对 rawfile 作为 `copy` 来源有实现差异。现有 `shalu2` 真机方案可作为同型号证据，但必须打包到自己的目标手表复测。

禁止对 `internal://app/rawfile/...` 调用 `writeText`、`writeArrayBuffer`、`delete`、`move` 目标写入或 `rmdir`。需要修改时复制到 `internal://app/...`。

## Storage 接口

`@system.storage` 是 FA 模型的小型字符串键值存储，从 API 3 起提供，在 SDK 中标记 API 6 起不再维护。不要仅凭 deprecated 就迁移 Lite 工程到新 Preferences API。

| 方法 | 必填 | 说明 |
| --- | --- | --- |
| `storage.get` | `key` | 可传字符串 `default`；成功回调直接接收 value |
| `storage.set` | `key`, `value` | value 必须是字符串；当前资料要求小于 128 字节 |
| `storage.delete` | `key` | 删除一个键 |
| `storage.clear` | 无 | 清空本应用全部键，谨慎使用 |

本地 SDK 声明 key 最多 32 个字符，并限制特殊字符。key 使用短 ASCII 常量。不要把令牌、隐私数据或大 JSON 当作普通缓存塞入 storage。

```js
import storage from '@system.storage';

export function saveVolume(value) {
  storage.set({
    key: 'volume',
    value: String(value),
    fail: function (data, code) {
      console.error('storage.set failed: ' + code + ', ' + data);
    }
  });
}

export function loadVolume(done) {
  storage.get({
    key: 'volume',
    default: '0.5',
    success: function (value) {
      const parsed = Number(value);
      done(isNaN(parsed) ? 0.5 : parsed);
    },
    fail: function () {
      done(0.5);
    }
  });
}
```

`storage.get` 返回字符串。若存 JSON，先检查长度和版本，再 `try/catch JSON.parse`；同时存在的 JSON 源字符串与对象树会抬高 heap 峰值。迁移数据时写入版本键，解析失败回退默认值，不让启动白屏。

## 低内存规则

- `readText` 默认最多按 4096 字节设计；不要先读完整大文件再 `JSON.parse`。
- `readArrayBuffer` 必须给受控 `length`。读取图片、音频等大文件到 JS buffer 会占用 JS heap，与媒体/图片池不是同一预算。
- `file.get({ recursive: true })` 和大目录 `file.list` 会创建对象数组；限制目录文件数，处理后清空引用。
- 日志不要打印完整文本、buffer 或 `JSON.stringify(fileList)`。
- storage 值保持很小，频繁变化数据使用内存节流后再落盘。

## 模拟器和真机

已知部分 DevEco Studio 5.0/API 10 预览器及 Lite Wearable 模拟器不能调用 `@system.file`，也不能证明 rawfile 图片/音频路径有效。对 file/rawfile 功能：

1. 预览器只检查页面和非文件流程。
2. 构建签名 HAP，确认资源实际进入包。
3. 在目标真机测试首次安装、二次启动、文件已存在、空间不足、文件损坏和卸载重装。
4. 记录每一步回调和错误码，但发布版移除高频/大内容日志。

模拟器上的成功和失败都不能替代真机结论。

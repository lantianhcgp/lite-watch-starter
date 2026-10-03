# Lite Wearable 资源目录与路径规范

## 目录

- [目录模型](#目录模型)
- [common 私有公共资源](#common-私有公共资源)
- [rawfile 真机文件资源](#rawfile-真机文件资源)
- [选择规则](#选择规则)
- [验证要求](#验证要求)

## 目录模型

推荐结构：

```text
entry/src/main/
├── config.json
├── js/<Ability>/
│   ├── app.js
│   ├── pages/<page>/<page>.hml|.css|.js
│   └── common/                    # 可选，创建项目时通常不存在，开发者自行创建
│       ├── img/
│       │   └── icon.png
│       ├── utils.js
│       └── style.css
└── resources/
    └── rawfile/                   # 需要 @system.file 访问的原始文件
        ├── data.json
        └── audio/
```

开发文档说明 `common` 属于可选目录，并明确公共媒体、JS 和样式可放在其中。不要因为新工程没有 `common` 就把页面图片随意放到 `pages`、`resources/base/media` 或生成目录；需要页面直接引用资源时主动创建 `js/<Ability>/common`。

## common 私有公共资源

`common` 的“公共”是指同一应用/Ability 内多个页面共享，不是用户文件系统中的公共目录。打包后它属于应用私有资源命名空间，用户在真机文件目录中看不到，只有应用自身通过资源路径使用。

- 页面图片、动画帧和 CSS 背景图放在 `entry/src/main/js/<Ability>/common/` 或其子目录。
- HML 和 JS 数据中的媒体路径使用绝对资源路径，例如 `/common/img/icon.png`。
- CSS 使用 `url(/common/img/icon.png)`；带引号也可，但保持项目内一致。
- 公共 JS 代码放在 `common`，从页面使用相对路径导入，例如 `../../common/utils.js`。不要用 `/common/utils.js` 作为代码导入路径。
- 公共样式按相对路径 `@import '../../common/style.css'`。
- 当被导入的 JS 与调用代码不在同一目录时，被导入 JS 内部引用媒体必须使用 `/common/...` 绝对路径，因为 webpack 打包会改变代码目录。
- 图片文件名必须使用英文 ASCII，否则 Lite Wearable 可能无法识别或读取。硬性格式使用 `^[A-Za-z0-9][A-Za-z0-9_-]*\.(png|jpg|jpeg|bmp|gif|webp)$`；推荐全小写，例如 `enemy_01.png`。
- `common`、`rawfile` 内图片路径的子目录也只使用英文字母、数字、`_`、`-`。项目所在的 Windows 上级目录可以是中文，不受此规则影响。
- 文件名、目录名和引用路径大小写完全一致。禁止中文、空格、全角符号、emoji 和其他非 ASCII 图片名称；重命名时同步修改所有 HML、CSS、JS 和配置引用。

固定资源示例：

```html
<image src="/common/img/icon.png" class="icon"></image>
```

```javascript
import utils from '../../common/utils.js';
```

`common` 适合应用自带、只读、可被 HML/CSS 直接渲染的固定资源。不要试图用 `@system.file` 枚举或读写 `/common/...`，也不要把它当作用户可见文件路径。

## rawfile 真机文件资源

`resources/rawfile` 用于需要以文件方式读取的原始数据、音频或其他资源。按社区真机经验，打包后它会出现在真机侧应用可访问目录，通过以下 URI 使用：

```text
源码: entry/src/main/resources/rawfile/data.json
真机只读 URI: internal://app/rawfile/data.json
```

- 使用 `@system.file` 的 `readText`、`list`、`access`、`copy` 等接口访问。
- rawfile 打包区按只读资源处理；需要修改时先复制到 `internal://app/` 下的可写位置。
- 音频继续遵守 `audio-on-lite-wearable.md`：从 rawfile 复制后再交给 `@system.audio` 播放。
- 图片只有在业务明确需要文件接口路径时才放 rawfile。此类图片不能以 `/common/...` 方式假装成普通页面资源，必须按真实 URI/复制流程实现并在真机验证渲染。
- 不把电脑端 Node 工具、源素材、未使用文件或秘密信息放入 rawfile；它们会进入安装包和真机侧资源目录。

## 选择规则

| 需求 | 目录 | 访问方式 |
|---|---|---|
| HML/CSS 直接显示的应用内固定图片 | `js/<Ability>/common` | `/common/...` |
| 页面共享 JS | `js/<Ability>/common` | 相对 `import` |
| 页面共享 CSS | `js/<Ability>/common` | 相对 `@import` |
| 需要 `@system.file` 读取/枚举的 JSON、文本、二进制 | `resources/rawfile` | `internal://app/rawfile/...` |
| 需要播放的打包音频 | `resources/rawfile/audio` | 首次复制到 `internal://app/...` 后播放 |
| 应用图标等系统资源 | `resources/base/media` | 仅按配置/系统资源规则，不替代页面 `/common` 图片 |
| 运行时生成或用户修改的数据 | `internal://app/` 可写目录 | `@system.file`，不要写回 rawfile/common |

## 验证要求

按已知实际环境约束处理：部分 DevEco Studio 5.0/API 10 预览器和 Lite Wearable 模拟器不能调用 `@system.file`。因此：

1. `/common/...` 固定资源可先用构建和预览检查路径，但仍要在目标分辨率真机确认显示与图片池。
2. 任何 `internal://app/rawfile/...`、`@system.file`、rawfile 图片或复制流程都必须打包、签名并安装到真机测试。
3. 预览器/模拟器报 file 接口不可用时，不能据此改掉正确的真机实现；记录为环境限制。
4. 预览器/模拟器能够显示界面，也不能写成“rawfile 已验证”。发布结论必须明确列出真机读取、复制、路径、格式和异常恢复结果。
5. 审计 `/common/...` 静态路径是否存在；包含 `{{...}}` 的动态路径无法完全静态解析，必须遍历所有运行时组合并真机验证。
6. 审计所有打包图片的英文 ASCII 文件名和资源子目录；任一非法名称都属于发布阻塞项，不能以 Windows 或预览器偶尔能显示为放行依据。

此处“部分 DevEco Studio 5.0/API 10 预览器与模拟器不支持 file 接口”来自社区真机开发经验，应作为对应目标工具链的硬验证限制；若换用其他 SDK/模拟器版本，重新实测后再更新结论。

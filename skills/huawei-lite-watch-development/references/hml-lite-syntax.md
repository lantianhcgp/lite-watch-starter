# Lite Wearable HML 语法白名单

## 目录

- [判定原则](#判定原则)
- [内置标签](#内置标签)
- [公共属性与渲染指令](#公共属性与渲染指令)
- [标签专属属性](#标签专属属性)
- [事件](#事件)
- [父子结构](#父子结构)
- [HML 表达式](#hml-表达式)
- [AI 生成规则](#ai-生成规则)

## 判定原则

HML 不是 HTML，也不是 Vue、React JSX、ArkUI 或完整 OpenHarmony ArkUI。生成或修改 `.hml` 时只使用目标 SDK Lite 白名单中存在的标签、属性和事件。

本表依据：

- `<DevEco-SDK>/default/openharmony/js/build-tools/ace-loader/lib/templater/lite_component_map.js`
- 同目录 `component_validator.js`
- 华为官方 [ArkUI JS 完整组件参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkui-js-full-comp)
- 官方 Lite Wearable 开发文档的“HML语法参考”（需用户自行合法获取）

完整组件参考用于查询标签的完整属性、事件和用法，不是 Lite Wearable 白名单。若项目的 SDK 版本不同，先读取该 SDK 的同名文件并用它缩小范围。自定义组件标签需在项目中找到真实定义和注册，不能因“像组件名”或官方完整组件页中存在就放行。官方网页若因登录、地区或反爬限制无法读取，明确说明并使用本地 SDK，不得猜测。

## 内置标签

仅以下标签属于当前 SDK 的 Lite Wearable 内置白名单：

```text
div canvas stack qrcode list list-item swiper tabs tab-bar tab-content
image-animator image img progress text marquee analog-clock clock-hand
chart input slider switch picker-view
```

不要生成 Web 标签，如 `button`、`span`、`p`、`section`、`video`、`audio`、`svg`。Lite 按钮使用 `<input type="button">`。

## 公共属性与渲染指令

所有内置标签可用：

```text
id style class ref if elif else for tid show
```

也允许 `data-*`。约束如下：

- Lite 不支持 `class="{{...}}"` 动态绑定。使用固定类名，或在可验证范围内绑定具体 `style` 属性。
- 同一元素禁止同时设置 `if` 和 `for`。
- `if`、`elif`、`else` 必须是同一父节点下连续的兄弟节点；`elif`/`else` 不得脱离前序条件节点。
- `if`、`elif`、`show` 使用布尔值或 `{{...}}`；`if=false` 不构建节点，`show=false` 仍构建 VDOM。
- `for` 支持 `for="{{array}}"`、`for="{{value in array}}"`、`for="{{(index, value) in array}}"`，也支持文档中的不带花括号形式。
- `tid="id"` 是数组元素唯一字段名，不支持表达式。每个元素必须存在该字段并保持唯一。
- 页面 `data` 属性名不能以 `$` 或 `_` 开头，不要使用保留名 `for`、`if`、`show`、`tid`。

## 标签专属属性

除公共属性和 `data-*` 外，当前 SDK 白名单如下：

| 标签 | 专属属性与限制 |
|---|---|
| `qrcode` | 必需 `value`；`type=rect|circle` |
| `swiper` | `index` 数字；`loop=true|false`；`duration` 数字；`vertical=false|true` |
| `tab-bar` | `mode=fixed` |
| `image-animator` | 必需 `images`、`duration`；`iteration`；`reverse=false|true`；`fixedsize=true|false`；`fillmode=none|forwards` |
| `image` / `img` | `src` |
| `progress` | `type=horizontal|arc`；`percent` 数字 |
| `text` | `type=text|html`；`value` |
| `marquee` | `scrollamount` 数字 |
| `analog-clock` | `hour`、`min`、`sec` 数字 |
| `clock-hand` | `type=hour|min|sec`；`src` |
| `chart` | `type=line|bar`；`datasets`；`options` |
| `input` | `checked=true|false`；`type=button|checkbox|password|radio|text`；`name`、`value`、`placeholder`；`maxlength` 数字 |
| `slider` | `min`、`max`、`value` 数字 |
| `switch` | `checked=true|false` |
| `picker-view` | `type=text|time`；`range`；`selected` |

`div`、`canvas`、`stack`、`list`、`list-item`、`tabs`、`tab-content` 没有额外 HML 属性白名单。样式必须放在 `class`/`style` 或样式文件中，不能把浏览器属性猜测为可用。

## 事件

公共事件：

```text
click longpress touchstart touchmove touchcancel touchend key swipe
```

专属事件：

- `list`: `scrollend`
- `swiper`: `change`
- `tabs`: `change`
- `image-animator`: `stop`
- `input`: `change`
- `slider`: `change`
- `switch`: `change`
- `qrcode`: 仅 `click`、`longpress`、`swipe`
- `picker-view`: 仅 `change`

绑定形式包括 `@click`、`onclick`、`on:click`、`grab:click`，以及 SDK 接受的 `.bubble`/`.capture` 修饰。事件冒泡机制从 API 5 开始；面向更低 API 时不得依赖它。回调名和传参必须使用 HML 表达式可接受的 ES5 形式，不能在属性中写箭头函数。

## 父子结构

- `list` 的直接组件子节点只能是 `list-item`；`list-item` 的直接父节点必须是 `list`，且不能作为页面根。
- `swiper` 不支持包含 `list`。
- `tabs` 的直接组件子节点只能是 `tab-bar`、`tab-content`。
- `tab-bar` 的直接组件子节点只能是 `text`，且直接父节点必须是 `tabs`。
- `tab-content` 的直接组件子节点只能是 `div`、`stack`，且直接父节点必须是 `tabs`。
- `clock-hand` 的直接父节点必须是 `analog-clock`。
- `list-item`、带 `if`、带 `for` 或带 `else` 的组件不能作为页面根节点。
- 原子组件不能包含组件子节点。`text` 只承载文本内容；不要在其中嵌套其他组件。

## HML 表达式

开发文档明确规定：HML 中的 JS 表达式不支持 ES6。即使页面 `.js` 文件支持部分 ES6，也不能在 `{{...}}`、事件参数、`if`、`show`、属性绑定中使用：

- 箭头函数、`let`/`const`、`class`
- 模板字符串
- 解构、默认参数、剩余参数、展开语法
- `for...of`、模块声明
- `async/await`、生成器
- 可选链、空值合并、动态 `import()`

保持表达式短小：属性读取、数组索引、基础算术/比较/逻辑运算和简单方法调用。复杂计算、数组转换、格式化和容错逻辑放到 `.js` 方法或预先计算的 `data` 字段中。

```html
<!-- 允许 -->
<text if="{{visible}}">{{items[index].name}}</text>
<input type="button" value="放大" @click="multiply(2)"></input>

<!-- 禁止：箭头函数和模板字符串都属于 HML 中的 ES6 -->
<text>{{items.map(item => `${item.name}`).join(',')}}</text>
```

## AI 生成规则

1. 先从本页白名单选择标签，再查专属属性和事件；不确定即停止猜测并查当前 SDK。
2. 生成后运行 `scripts/audit_lite_watch_project.ps1`，再以 DevEco 的真实编译错误为准修正。
3. 审计脚本的未知标签可能是自定义组件；只有找到组件实现和注册后才能确认。
4. 不通过删除事件前缀、改成 Web 标签或把逻辑塞进内联表达式来绕过编译器。
5. 对 SDK 版本差异、事件语义和自定义扩展明确标为待构建/真机验证。

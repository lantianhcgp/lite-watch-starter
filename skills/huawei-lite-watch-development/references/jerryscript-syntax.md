# JerryScript 与 JavaScript 源码语法规范

## 目录

- [三个语法环境](#三个语法环境)
- [JS 源码明确支持](#js-源码明确支持)
- [仅在构建和真机证明后使用](#仅在构建和真机证明后使用)
- [未列入支持范围](#未列入支持范围)
- [低内存编码约束](#低内存编码约束)
- [构建产物检查](#构建产物检查)
- [示例](#示例)

## 三个语法环境

不要把以下环境混为一谈：

1. 页面 `.js` 源码由 DevEco 构建链处理，开发文档明确允许一部分 ES6。
2. `.hml` 中的 `{{...}}` 表达式明确不支持 ES6；详见 [hml-lite-syntax.md](hml-lite-syntax.md)。
3. `loader_out_lite` 构建产物才是表端实际执行输入，仍需检查最低目标设备的 JerryScript 和内存行为。

资料依据：官方 Lite Wearable 开发文档的“JS语法参考”明确列出 Lite Wearable ES6 子集；同一文档的“HML语法参考”明确写明 HML 中的 JS 表达式不支持 ES6。官方原文需用户自行从合法渠道获取，本仓库不再分发。

## JS 源码明确支持

开发文档只明确列出以下 ES6 源码语法：

- `let` / `const`
- 箭头函数
- `class`
- 默认值（按默认参数理解）
- 解构赋值
- 解构绑定模式
- 增强对象初始化器，包括属性/方法简写和计算属性
- `for...of`
- 剩余参数
- 模板字符串
- 静态模块声明：`import` / `export`

这些语法属于“允许作为 `.js` 构建输入”，不是“在任何位置、任何固件上无限制使用”。新增代码可以使用，但在 64/256 KB heap、旧 SDK 或跨代兼容任务中，优先选择能减少转译 helper、闭包和临时对象的写法。不得把这份列表扩张成“完整 ES6 都支持”。

## 仅在构建和真机证明后使用

以下不是语法白名单本身，而是运行时内建能力或异步机制。只有目标 SDK 声明、构建产物和最低目标真机共同证明后才能使用：

- `Promise`
- `Map`、`Set`、`WeakMap`、`WeakSet`
- `Symbol`、`Proxy`、`Reflect`
- 新增的 `Object`、`Array`、`String`、`Number` 方法
- `Uint8Array` 等 TypedArray；接口文档要求时仍需核对 API 与真机

不要通过大型 polyfill 集补齐缺失能力。单个、小型、已测且内存预算明确的兼容函数才可考虑。

## 未列入支持范围

开发文档的 Lite Wearable ES6 列表未包含以下能力。默认禁止生成或迁入表端运行代码：

- `async` / `await`
- 生成器、`function*`、`yield`
- 展开语法：数组、函数调用或对象中的 `...value`；文档仅列“剩余参数”，未列 spread
- 动态 `import()`
- 可选链 `?.`、空值合并 `??`
- 公有/私有类字段、静态初始化块、装饰器
- BigInt 字面量和 BigInt 依赖
- `eval`、`Function` 构造器或动态执行下载文本
- QuickJS、Babel、webpack、解释器或通用运行时嵌入
- Node.js 的 `require`、`fs`、`path`、`Buffer`、`process` 或 npm Node 运行库

若既有工程含上述语法，不得仅因编译成功就接受。先检查它是否被完全转译、是否引入运行时依赖和 helper，再做最低档真机验证；无法证明时改写为文档白名单内语法。

## 低内存编码约束

语法可用不代表内存代价合适：

- 高频路径避免链式 `map/filter/reduce`、反复解构大对象、对象复制和大量箭头闭包。
- 模板字符串和字符串拼接都可能产生峰值副本；大文本必须分片。
- `class` 不应催生大对象层次；页面对象和小型模块通常更省。
- `for...of` 的构建产物可能产生迭代 helper；大数组或 64 KB 档优先传统索引循环。
- 默认参数、解构和剩余参数若导致大量 helper，改为显式参数检查和有界数组处理。
- 静态模块按功能拆分，但避免为了风格产生大量微型模块和重复包装。

## 构建产物检查

构建后运行：

```powershell
powershell -ExecutionPolicy Bypass -File <skill-dir>\scripts\audit_lite_watch_project.ps1 `
  -ProjectPath <项目目录> -TargetHeapKB 64 -TargetApi 6 `
  -BuiltJsPath <项目>\entry\build\default\intermediates\loader_out_lite\default\js
```

重点确认：

1. 构建产物中没有“未列入支持范围”的语法。
2. 构建产物没有依赖目标 JerryScript 缺失的 Promise、迭代器或新内建对象。
3. Babel helper 与模块包装没有把代码量和冷启动峰值推过目标 heap。
4. rawfile 中的电脑端工具脚本不会被表端导入或动态执行。
5. 最低 heap/API 真机覆盖所有语法相关分支。

审计脚本是启发式扫描。命中注释、字符串或正则字面量时要回到源文件确认，不得直接修改构建产物。

## 示例

`.js` 源码中允许的文档子集：

```javascript
const clamp = (value, min = 0, max = 1) => {
  return Math.max(min, Math.min(max, value));
};

export default {
  data: { volume: 0.5 },
  setVolume(value) {
    this.volume = clamp(value);
  }
};
```

对 64 KB heap 或无法检查构建产物的工程，可采用更保守写法降低转译和闭包风险：

```javascript
function clamp(value, min, max) {
  min = min === undefined ? 0 : min;
  max = max === undefined ? 1 : max;
  return Math.max(min, Math.min(max, value));
}
```

即使 `.js` 中允许箭头函数，HML 仍禁止：

```html
<!-- 错误：HML 表达式不支持 ES6 -->
<text>{{items.map(item => item.name).join(',')}}</text>
```

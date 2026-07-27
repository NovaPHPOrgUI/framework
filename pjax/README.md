# PJAX 路由

## 概述

自研 `PjaxUtils`，实现页面无刷新加载，无第三方 PJAX 依赖。

## 工作原理

PJAX 请求返回后，框架自动替换四个锚点元素：

| 选择器 | 作用 |
|--------|------|
| `#title` | 页面标题 |
| `#style` | 页面级 CSS |
| `#container` | 页面主体内容 |
| `#script` | 页面 JS 入口 |

## 生命周期

`loadUrl()` 把片段来源统一成一个 `Promise<string>`，三种来源走同一条消费路径：

```
loadUrl 开始 → 已在加载中则忽略本次跳转
             → beginLoad()：NProgress 开始 → $.emitter.off() → pageOnUnLoad()
             → 取片段：首屏 seed / 悬停预取命中 / 实时请求
成功 → switchContent() → 复位视口（seed 除外）→ handleSuccess()
       → onComplete(url) 更新 sidebar → 等待 pageOnLoad → pageOnLoad()
失败 → handleError()：跳转 /404 错误页
```

> 导航期间的新跳转会被**忽略**而非打断：mdui 的 `$.ajax` 返回裸 Promise，没有 `abort()`，在途请求无法中止。

## 首屏 seed（零请求首屏）

`layout.js` 启动时会对当前地址执行一次 `loadUri()`。若后端已把当前页片段直出进 layout：

```html
<template id="page"><!-- 子页面片段 --></template>
```

`loadUrl()` 会直接消费并移除该 `<template>`，省掉首屏那次 PJAX 请求。`<template>` 内容不进入活动 DOM，所以其中的 `#title` / `#style` / `#container` / `#script` 不会和 layout 自身的锚点冲突。

后端约定见 `nova/plugin/tpl/README.md` 的「布局与首屏直出」。没有该 `<template>` 时行为不变，仍走一次请求。

> seed 的消费是在 layout 的**全部四个锚点都已解析出来之后**才发生的。若某个 layout 把初始化 `PjaxUtils` 的脚本内联在页面中间，它必须排在 `<script id="script">` 之后，否则 `switchContent` 会报 `missing #script`。

## 悬停预取

`pjaxUtils.prefetch(uri)` 提前发起片段请求，点击同一地址时 `loadUrl()` 直接复用，省掉一次往返。

```javascript
$('#docListContainer').on('mouseover', (e) => {
    const card = e.target.closest('[data-pjax-item][data-href]');
    if (card) pjaxUtils.prefetch(card.getAttribute('data-href'));
});
```

设计上是**单槽抢跑，不是缓存**：

- 只保留最近一个预取结果，取走即清空，绝不复用第二次——`PjaxUtils` 是活到整页刷新的全局单例，缓存整页片段会读到过期内容
- 同一地址重复 `prefetch()` 直接返回，所以 `mouseover` 不需要防抖
- 预取失败静默清槽，点击时按正常流程重发

不要无脑绑到所有 `[data-pjax-item]` 上。PJAX 片段是整页渲染（登录校验、权限过滤、模板渲染都要跑一遍），鼠标扫过一排菜单就是一排请求。只给用户会「扫视 → 犹豫 → 点击」的入口加，比如搜索结果列表。

## 子页面模板

```html
<title id="title">{$title}</title>
<style id="style"></style>
<div id="container" class="container"></div>
<script id="script" src="/static/js/xxx.js?v={$__v}"></script>
```

## 子页面 JS

```javascript
window.pageLoadFiles = [];
window.pageOnLoad = function () {
    // 所有初始化逻辑...
    window.pageOnUnLoad = function () {
        // 清理逻辑...
    };
    return false;
};
```

## JS 手动跳转

```javascript
// 在 layout.js 中已初始化 pjaxUtils 实例
// 菜单项通过 data-link + data-pjax="true" 自动跳转
// 带 [data-pjax-item] 的元素点击后跳转到 data-href
```

## NProgress 进度条

页面切换时自动显示顶部进度条（`nprogress.js`），无需手动控制。


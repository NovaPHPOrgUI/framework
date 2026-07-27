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

```
loadUrl 开始  → beginLoad()：NProgress 开始 → $.emitter.off() → pageOnUnLoad()
命中首屏 seed → 直接 switchContent()，不发请求
请求失败      → handleError()：跳转 /404 错误页
请求成功/展示错误页后 → handleSuccess() → onComplete(url) 更新 sidebar → 等待 pageOnLoad → pageOnLoad()
```

## 首屏 seed（零请求首屏）

`layout.js` 启动时会对当前地址执行一次 `loadUri()`。若后端已把当前页片段直出进 layout：

```html
<template id="page"><!-- 子页面片段 --></template>
```

`loadUrl()` 会直接消费并移除该 `<template>`，省掉首屏那次 PJAX 请求。`<template>` 内容不进入活动 DOM，所以其中的 `#title` / `#style` / `#container` / `#script` 不会和 layout 自身的锚点冲突。

后端约定见 `nova/plugin/tpl/README.md` 的「布局与首屏直出」。没有该 `<template>` 时行为不变，仍走一次请求。

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


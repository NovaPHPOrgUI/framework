# PJAX 路由

## 概述

基于 [pjax.js](https://github.com/MoOx/pjax) 封装的 `PjaxUtils`，实现页面无刷新加载。

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
pjax:send     → NProgress 开始 → $.emitter.off() → pageOnUnLoad()
pjax:error    → 跳转 /404 错误页
pjax:complete → 等待 pageOnLoad 声明 → $.loader 加载 pageLoadFiles → pageOnLoad()
```

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


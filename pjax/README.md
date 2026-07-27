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

`layout.js` 已对全部 `[data-pjax-item]` 开启，无需页面自己接。手动调用入口是 `pjaxUtils.prefetch(uri)`：提前发起片段请求，点击同一地址时 `loadUrl()` 直接复用，省掉一次往返。

设计上是**单槽抢跑，不是缓存**：

- 只保留最近一个预取结果，取走即清空，绝不复用第二次——`PjaxUtils` 是活到整页刷新的全局单例，缓存整页片段会读到过期内容
- 同一地址重复 `prefetch()` 直接返回
- 预取失败静默清槽，点击时按正常流程重发

### 必须有 hover-intent

单槽限制的是「保留的结果」，**不是「发出的请求」**：换一个 href 就立刻发一次，旧请求还在飞（无法 abort）。而 PJAX 片段是整页渲染，登录校验、权限过滤、菜单构建、模板渲染都要跑一遍。

顶栏导航横向排列，鼠标去右侧工具区必然扫过一整排；侧边栏纵向排列，点第 5 项必然扫过前 4 项。所以 `layout.js` 里换一项就重新计时，只有停住的那一项能等满 `HOVER_INTENT_MS`（100ms），划过的全部作废：

```javascript
.on("mouseover", "[data-pjax-item]", function () {
    const href = $(this).data("href");
    if (!href || href === hoverIntentHref) {
        return;
    }
    hoverIntentHref = href;
    clearTimeout(hoverIntentTimer);
    hoverIntentTimer = setTimeout(() => {
        hoverIntentHref = "";
        pjaxUtils.prefetch(href);
    }, HOVER_INTENT_MS);
})
```

不监听 `mouseout`——移到子元素也会触发，反而打断计时；靠 href 去重就够了。代价是鼠标扫过后停在最后一项再离开时会多发一次请求。

### 预取请求带 `X-PJAX-Prefetch: true`

预取不是真实导航，后端必须能区分。`prefetch()` 走 `this.prefetchHttp`，比正常客户端多带一个 `X-PJAX-Prefetch: true`。

目前后端用它跳过 `LoginManager::setRedirectUriIfNeeded()`：该方法会把当前 URI 记成「登录后跳转目标」，若预取也记，会话过期时划过 A 再点 B，登录后会落到 A。

**给 GET 加任何写副作用之前，先想清楚它被预取时会怎样。**

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


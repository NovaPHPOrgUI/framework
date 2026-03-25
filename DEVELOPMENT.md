# 前端开发规范

> 本文档面向 AI 及开发者，定义本项目前端代码的技术栈、架构约定和编码规范。  
> 所有新增 / 修改前端代码 **必须** 遵守以下规则。  
> 各组件的详细使用方式，请查阅对应目录下的 `README.md`。

---

## 1. 技术栈

| 层面 | 技术 | 说明 |
|------|------|------|
| UI 框架 | [MDUI 2](https://www.mdui.org/) | Material Design 组件库，全局 `mdui.global.min.js` |
| DOM 操作 | `mdui.$`（别名 `$` / `jQuery`） | **不是标准 jQuery**，是 MDUI 内置轻量 DOM 库，API 类似 |
| 页面路由 | PJAX | 单页切换，局部替换 `#container`、`#title`、`#style`、`#script` |
| 样式 | SCSS → CSS + MDUI 颜色系统 + 自定义工具类 | 详见 `README.md` |
| 资源加载 | `$.loader` / `window.jsMap` | 按需加载组件 JS/CSS |
| 模板引擎 | Smarty（`.tpl`） | 后端渲染页面骨架 |

---

## 2. 目录结构

```
static/
├── framework/              # 框架核心
│   ├── bootloader.js       # 启动器：全局变量、jsMap
│   ├── layout.js           # 布局：菜单、PJAX、全局事件
│   ├── layout.tpl          # 主布局模板
│   ├── tpl.tpl             # 子页面骨架模板
│   ├── base.scss           # 全局 Reset + 工具类（详见 README.md）
│   ├── utils/              # 框架工具类
│   ├── pjax/               # PJAX 路由
│   ├── theme/              # 主题切换 Web Component
│   ├── language/           # 多语言 Web Component
│   ├── imageLoader/        # 图片懒加载 Web Component
│   └── libs/               # 第三方库（mdui、vhcheck）
├── components/             # 可复用业务组件（各自有 README.md）
│   ├── dataTable/          # 数据表格
│   ├── captcha/            # 验证码
│   └── ...
├── js/                     # 页面级脚本（与后端路由对应）
├── css/                    # 页面级样式（按需）
├── icons/                  # 站点图标
└── images/                 # 静态图片
```

### 约定

- **页面 JS** 放在 `js/` 下，路径与后端路由一一对应。  
  例：路由 `/admin/asset/ipPool` → `js/admin/asset/ipPool.js`
- **可复用组件** 放在 `components/`，每个组件一个文件夹，**必须**包含 `README.md`。
- **框架工具类** 放在 `framework/utils/`，作为全局单例挂载在 `$` 上。

---

## 3. PJAX 页面生命周期

```
1. PJAX 请求返回 → 替换 #container、#title、#style、#script
2. 旧页面清理     → $.emitter.off() + window.pageOnUnLoad()
3. 依赖加载       → 按 window.pageLoadFiles 加载所需组件
4. 页面初始化     → 调用 window.pageOnLoad()
```

### 生命周期协议

```javascript
// 声明依赖（对应 window.jsMap 中的 key）
window.pageLoadFiles = ['DataTable'];

// 页面初始化入口（必须 return false）
window.pageOnLoad = function () {
    // 所有逻辑写在这里...
    return false;
};

// 可选：卸载钩子
window.pageOnUnLoad = function () { };
```

> ⚠️ `pageOnLoad` **必须** `return false`。

---

## 4. 全局 API 速查

以下工具在 `publicScript.tpl` 中自动加载，所有页面可直接使用。

### 4.1 `$` — DOM 操作（优先使用）

`$` 是 `mdui.$`，**所有 DOM 操作必须优先使用 `$()`**。

```javascript
$('#myBtn')                                  // 查询
$('#btn').on('click', function () {});       // 事件
$('#el').attr('data-id', '123');             // 属性
$('#el').addClass('active');                 // 类名
$('#el').css('display', 'none');             // 样式
$('#list').find('mdui-list-item').each(fn);  // 遍历
$('#container').html('<p>内容</p>');          // 内容
```

### 4.2 `$.request` — HTTP 请求

```javascript
$.request.get(url, params, onSuccess, onError);
$.request.postForm(url, data, onSuccess, onError);
$.request.postJson(url, data, onSuccess, onError);
$.request.put(url, data, onSuccess, onError);
$.request.delete(url, data, onSuccess, onError);

// 并发
$.request.all([
    { method: 'GET', url: '/a', data: {} },
    { method: 'GET', url: '/b', data: {} },
], function (err, responses) {});

// SSE
const es = $.request.sse('/api/stream', {
    params: {},
    onMessage: function (data, event) {},
    eventHandlers: { customEvent: function (data) {} },
    onError: function (evt) {},
    autoReconnect: true,
});
es.close();
```

**后端响应约定：** `{ "code": 200, "msg": "成功", "data": {} }`

- `200` → 成功
- `401` → 框架自动拦截跳登录页
- 其他 → `$.toaster.error(response.msg)`

### 4.3 `$.form` — 表单操作

```javascript
$.form.get('#form');                         // 取值
$.form.set('#form', { name: 'test' });       // 赋值
$.form.val('#form', data);                   // 语法糖
$.form.validate('#form');                    // 验证
$.form.reset('#form');                       // 重置
$.form.submit('#form', {                     // 提交
    beforeSubmit: fn,
    callback: fn,
    afterSubmit: fn,
});
$.form.manage(uri, '#form', {                // 一体化管理
    beforeSet: fn, afterSet: fn,
    beforeSubmit: fn, afterSubmit: fn,
});
$.form.setSelectOptions('#select', items);   // 动态选项
```

### 4.4 `$.toaster` — 消息提示

```javascript
$.toaster.info('提示');
$.toaster.success('成功');
$.toaster.warn('警告');
$.toaster.error('错误');
```

### 4.5 `$.layer` — 弹层

```javascript
$.layer.alert({ msg, yes, title, btn });
$.layer.confirm({ msg, yes, no, title, btnConfirm, btnCancel });
$.layer.html({ title, content, buttons: [{ text, onClick }], onOpen, onClosed });
$.layer.msg({ message, time });
$.layer.load();
$.layer.iframe({ src, title });
$.layer.close(id);
$.layer.closeAll();
```

### 4.6 `$.emitter` — 事件管理

```javascript
$.emitter.on('event', handler);              // 监听
$.emitter.once('event', handler);            // 一次性
$.emitter.emit('event', data);               // 触发
$.emitter.off('event', handler);             // 移除
$.emitter.on(domElement, 'click', handler);  // DOM 事件（PJAX 自动清理）
```

### 4.7 `$.logger` — 分级日志

```javascript
$.logger.setLevel('debug'); // debug | info | warn | error
$.logger.debug('调试');
$.logger.info('信息');
$.logger.warn('警告');
$.logger.error('错误');
```

### 4.8 `$.loader` — 动态资源加载

```javascript
$.loader(['DataTable', 'Layer'], function () { /* 就绪 */ });
$.loader(['/path/to/file.js'], callback);
```

### 4.9 `$.fade` — 淡入淡出

```javascript
$.fade.out(element, callback);
$.fade.in(element, callback);
```

### 4.10 `Loading` — 加载动画

```javascript
// JS 方式
const loading = new Loading('#container', '加载中');
loading.show();
loading.setProgress(50);
loading.setText('处理中');
loading.close();

// jQuery 插件
$('#el').showLoading('加载中');
$('#el').updateLoading('处理中');
$('#el').closeLoading();

// HTML 属性驱动：添加 loading 属性自动显示，移除自动关闭
```

### 4.11 `$.url` — URL 参数（按需加载）

```javascript
$.url.getParam('id');
$.url.setParam('page', 2);
$.url.deleteParam('filter');
$.url.getAllParams();
$.url.setUri('/new/path');
```

### 4.12 其他全局工具

```javascript
$.escapeHtml(str);             // HTML 转义（防 XSS，动态拼接 HTML 时必须使用）
$.copy('文本');                 // 复制到剪贴板
$.formatDateTime(new Date());  // → "2026-03-25 14:30:00"
$.waitElement(selector, fn);   // 等待 DOM 元素出现
$.waitProp(obj, prop, fn);     // 等待对象属性存在
$.waitClass(selector, parent, fn); // 等待 class 出现
```

### 4.13 全局变量

| 变量 | 说明 |
|------|------|
| `window.baseUri` | 站点根 URL |
| `window.debug` | 调试模式开关 |
| `window.version` | 版本号 |
| `window.jsMap` | 组件映射表 |

---

## 5. Framework 内置功能

以下功能由 framework 自动初始化，无需在 `pageLoadFiles` 中声明。

### 5.1 主题切换 `<theme-switcher>`

```html
<theme-switcher iconBtn="true"></theme-switcher>
```

- 亮色 / 暗色 / 自动三种模式
- 6 种预设颜色 + 自定义颜色
- 自动存储到 `localStorage`（key: `theme`、`color`）
- 事件：`$.emitter.on('theme', fn)` / `$.emitter.on('color:set', fn)`

### 5.2 多语言切换 `<lang-switcher>`

```html
<lang-switcher iconBtn="true"></lang-switcher>
```

- 支持：简中、繁中、English、日本語、한국어、Русский、Français
- 基于 Microsoft Translator API 自动翻译
- 存储到 `localStorage`（key: `language`）
- JS 翻译：`$.translate('文本', function (result) {})`
- 页面元素添加 `class="no-translate"` 可跳过翻译

### 5.3 图片懒加载 `<image-loader>`

```html
<image-loader src="/images/photo.jpg" placeholder="/placeholder.png"
    default="/fallback.png" duration="300" cancel-delay="500">
</image-loader>
```

- 基于 `IntersectionObserver`，进入视口才加载
- 渐变动画过渡
- 离开视口自动取消加载

### 5.4 PJAX 路由

由 `layout.js` 自动初始化。替换四个锚点：`#title`、`#style`、`#container`、`#script`。

- 菜单项 `data-link` + `data-pjax="true"` → 自动 PJAX 跳转
- 元素 `[data-pjax-item]` + `data-href` → 点击跳转
- 顶栏滚动时自动添加 `scrolling` 属性

### 5.5 jsMap 组件注册

`bootloader.js` 中的 `window.jsMap` 定义可按需加载的组件映射，`pageLoadFiles` 使用 key 名：

```javascript
window.pageLoadFiles = ['DataTable', 'Layer'];
```

---

## 6. 页面 JS 编写规范

### 6.1 核心规则

> ⚠️ **所有页面函数、变量必须定义在 `pageOnLoad` 内部，严禁暴露到全局作用域。**

```javascript
window.pageLoadFiles = ['DataTable'];
window.pageOnLoad = function () {

    function buildTableUri(extraParams) { /* ... */ }
    function statusChip(value) { /* ... */ }

    const table = new DataTable('#xxxTable');
    table.load({ uri: buildTableUri(), /* ... */ });

    $('#applyFiltersBtn').on('click', function () { /* ... */ });

    return false;
};
```

### 6.2 编码风格

| 规则 | 说明 |
|------|------|
| 作用域 | **所有页面函数和变量定义在 `pageOnLoad` 内** |
| DOM 操作 | **优先使用 `$()`** |
| 变量声明 | 优先 `const`，需重新赋值用 `let`，**禁止** `var` |
| 函数定义 | 辅助函数用 `function` 声明；回调可用箭头函数 |
| 分号 | **必须** |
| 缩进 | 4 空格 |
| 引号 | 字符串**单引号**，HTML 模板**反引号** |
| 命名 | 变量/函数 `camelCase`；常量 `UPPER_SNAKE_CASE`；CSS `kebab-case` |
| HTML 转义 | 动态拼接 **必须** `$.escapeHtml()` |

### 6.3 事件绑定

```javascript
// ✅ 优先用 $
$('#btn').on('click', handler);

// ✅ 需 PJAX 自动清理
$.emitter.on($('#btn')[0], 'click', handler);

// ❌ 禁止
document.addEventListener('click', handler);
```

---

## 7. 模板规范（.tpl）

### 子页面必须包含

```html
<title id="title">标题 - {$title}</title>
<style id="style"></style>
<div id="container" class="p-3">
    <!-- 页面内容 -->
</div>
<script id="script" src="/static/js/xxx.js?v={$__v}"></script>
```

### UI 组件

统一使用 MDUI 2 Web Components（`mdui-button`、`mdui-text-field`、`mdui-select` 等）。

### 样式规范

- **优先使用框架工具类**（`p-3`、`mt-3`、`rounded-lg`、`shadow`、`bg-surface`、`d-flex` 等）
- **颜色必须用 MDUI 语义色**，**禁止**硬编码
- 页面特殊样式写在 `<style id="style">` 内

---

## 8. Web Component 规范

```javascript
class MyComponent extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    connectedCallback() { }
    disconnectedCallback() { }
}
customElements.define('my-component', MyComponent);
```

- 标签名 **kebab-case** 含连字符
- 样式封装在 Shadow DOM 内

---

## 9. 禁止事项

| ❌ 禁止 | 原因 |
|---------|------|
| `pageOnLoad` 外定义页面函数/变量 | PJAX 不清理全局 |
| 引入标准 jQuery | 项目用 `mdui.$` |
| `document.write()` | 破坏 PJAX |
| 内联 `onclick` 属性 | 维护困难 |
| 硬编码颜色值 | 破坏主题/深色模式 |
| 操作 PJAX 锚点外的布局 DOM | 框架管理 |
| ES Module `import/export` | 无打包器 |

---

## 10. 资源加载与缓存

模板中合并加载：`/static/bundle?file=a.css,b.css&type=css&v={$__v}`  
JS 中 `$.loader` 自动追加版本号。

---

## 11. 速查：新增表格页面

1. **后端**：控制器方法支持 `format=table` → `{ data: [], count: N }`
2. **模板**：`src/app/view/admin/模块/xxx.tpl`
3. **脚本**：`static/js/admin/模块/xxx.js`
4. **测试**：PJAX → 表格 → 筛选 → 分页


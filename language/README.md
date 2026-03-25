# Language 多语言切换

## 用法

Web Component，在布局模板中自动加载：

```html
<!-- 图标按钮模式 -->
<lang-switcher iconBtn="true"></lang-switcher>

<!-- FAB 浮动按钮模式 -->
<lang-switcher></lang-switcher>
```

## 支持语言

| 语言 ID | 名称 | 翻译服务 ID |
|---------|------|-------------|
| `chinese_simplified` | 简体中文 | `zh-CHS` |
| `chinese_traditional` | 繁體中文 | `zh-CHT` |
| `english` | English | `en` |
| `japanese` | 日本語 | `ja` |
| `korean` | 한국어 | `ko` |
| `russian` | Русский | `ru` |
| `french` | Français | `fr` |

## 翻译机制

- 基于 Microsoft Translator API 自动翻译页面 DOM 文本
- `TranslateUtils` 在 PJAX 页面加载后自动执行翻译
- 语言设置存储到 `localStorage`（key: `language`）
- 默认语言跟随 `<html lang>` 属性

## JS 手动翻译

```javascript
$.translate('要翻译的文本', function (translatedText) {
    console.log(translatedText);
});
```

## 跳过翻译

在元素上添加 `no-translate` 类名：

```html
<span class="no-translate">不翻译的内容</span>
```

以下标签自动跳过：`style`、`script`、`code`、`pre`、`svg`、`canvas`、`video`、`audio`

## 事件

```javascript
// 翻译开始
$.emitter.on('translate:start', function () {});

// 翻译语言设置完成
$.emitter.on('translate:set', function () {});
```


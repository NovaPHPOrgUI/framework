# Theme Switcher 主题切换

## 用法

Web Component，在布局模板中自动加载：

```html
<!-- 图标按钮模式 -->
<theme-switcher iconBtn="true"></theme-switcher>

<!-- FAB 浮动按钮模式 -->
<theme-switcher></theme-switcher>
```

## 功能

- **三种模式**：亮色（`light`）、暗色（`dark`）、自动（`auto`）
- **预设颜色**：红、紫、蓝、绿、黄、灰 6 种
- **自定义颜色**：通过颜色选择器自由选色
- 主题和颜色自动存储到 `localStorage`（key: `theme`、`color`）

## 事件

```javascript
// 监听主题模式切换
$.emitter.on('theme', function (mode) {
    // mode: 'light' | 'dark' | 'auto'
});

// 监听颜色变更
$.emitter.on('color:set', function (color) {
    // color: '#0061a4' 等十六进制颜色值
});
```

## 说明

- 基于 Shadow DOM，样式不泄漏
- 内部调用 `mdui.setTheme(mode)` 和 `mdui.setColorScheme(color)`
- 会自动切换 `<html>` 上的 `mdui-theme-*` 类名


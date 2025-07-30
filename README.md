# Framework 样式指南

## 字重工具类

### 基础字重
```html
<p class="font-thin">超细字重 (100)</p>
<p class="font-extralight">极细字重 (200)</p>
<p class="font-light">细字重 (300)</p>
<p class="font-normal">正常字重 (400)</p>
<p class="font-medium">中等字重 (500)</p>
<p class="font-semibold">半粗字重 (600)</p>
<p class="font-bold">粗体字重 (700)</p>
<p class="font-extrabold">极粗字重 (800)</p>
<p class="font-black">最粗字重 (900)</p>
```

### 数字字重
```html
<p class="font-100">字重 100</p>
<p class="font-400">字重 400</p>
<p class="font-700">字重 700</p>
```

### 字体样式
```html
<p class="italic">斜体文本</p>
<p class="not-italic">非斜体文本</p>
```

## MDUI 颜色系统

### 基础颜色
```html
<!-- 文本颜色 -->
<p class="text-primary">主色文本</p>
<p class="text-secondary">次色文本</p>
<p class="text-error">错误色文本</p>
<p class="text-on-surface">表面文本</p>

<!-- 背景颜色 -->
<div class="bg-primary">主色背景</div>
<div class="bg-surface-container">容器背景</div>
```

### 透明度变化
```html
<p class="text-on-surface-87">87% 透明度</p>
<p class="text-on-surface-60">60% 透明度</p>
<p class="text-on-surface-38">38% 透明度</p>
<p class="text-on-surface-12">12% 透明度</p>
```

## 交互状态

### 悬停效果
```html
<button class="hover:text-primary hover:font-semibold">
  悬停变色加粗
</button>
```

### 焦点效果
```html
<input class="focus:text-primary focus:font-medium" type="text">
```

## 响应式支持

```html
<!-- 响应式字重 -->
<h1 class="font-normal md:font-bold lg:font-black">
  响应式标题
</h1>

<!-- 响应式颜色 -->
<p class="text-on-surface sm:text-primary lg:text-secondary">
  响应式文本颜色
</p>
```

## 文本装饰

```html
<p class="underline">下划线</p>
<p class="line-through">删除线</p>
<p class="no-underline">无装饰</p>
```

## 字母间距

```html
<p class="tracking-tight">紧密间距</p>
<p class="tracking-normal">正常间距</p>
<p class="tracking-wide">宽松间距</p>
```

## 行高

```html
<p class="leading-tight">紧密行高</p>
<p class="leading-normal">正常行高</p>
<p class="leading-loose">宽松行高</p>
```

## 文本大小写

```html
<p class="uppercase">UPPERCASE</p>
<p class="lowercase">lowercase</p>
<p class="capitalize">Capitalize</p>
```

## 使用建议

1. **MDUI 设计原则**: 使用完整的 MDUI 颜色系统，确保设计一致性
2. **可访问性**: 注意文本对比度，特别是使用透明度变化时
3. **响应式设计**: 合理使用响应式字重和颜色变化
4. **性能优化**: 避免过度使用交互状态，保持页面性能


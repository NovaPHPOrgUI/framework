# nova-pjax

## layout
### Html
```html
<!doctype html>
<html lang="zh-CN" class="mdui-theme-light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no"/>
    <meta name="renderer" content="webkit"/>
    <title id="title">{$title}</title>
    {include file="publicHeader.tpl"}
    <link rel="stylesheet" href="/static/css/init.css">
    <style id="style">
    </style>
</head>

<body class="bg">
{include file="publicScript.tpl"}
<script src="/static/js/init.js"></script>
<div id="container">
    

</div>
<script id="script"> </script>
</body>
</html>


```
### init.js
```javascript
$.loader(['Pjax'], () => {
    let pjax = new PjaxUtils(true, function () {
    }, "/404");

    let bar = $('mdui-navigation-bar');
    bar.val(window.location.pathname);
    // window.location.pathname+window.location.search
    bar.on("change", function () {
        if (window.location.pathname !== bar.val()) {
            pjax.loadUri(bar.val());
        }
    });
    pjax.loadUri(window.location.pathname);
});
```

## SubPage

### Html

```html
<title id="title">{$title}</title>
<style id="style"></style>
<div id="container" class="container"></div>
<script id="script" src="/static/js/index.js"></script>
```

### index.js
```javascript
window.pageLoadFiles = [];
window.pageOnLoad = function (loading) {
    window.pageOnUnLoad = function () {
    };
    return false
};
```

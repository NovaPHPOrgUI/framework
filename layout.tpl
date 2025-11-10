<!doctype html>
<html lang="zh-CN" class="mdui-theme-light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no"/>
    <meta name="renderer" content="webkit"/>
    <title id="title">{$title}</title>
    {include file="publicHeader.tpl"}
    <link rel="stylesheet" href="/static/css/init.css?v={$__v}">
    <style id="style">
    </style>
</head>

<body class="bg" style="height: var(--vh)">
{include file="publicScript.tpl"}
<script src="/static/js/init.js?v={$__v}"></script>
<div>
    <mdui-top-app-bar variant="center-aligned"  style="position: relative" class="bg">
        <mdui-top-app-bar-title class="title-medium title center-both" >
            {$title}
        </mdui-top-app-bar-title>
        <mdui-button icon="filter_list" variant="text" style="display: none" id="filter">筛选</mdui-button>
    </mdui-top-app-bar>

    <div style="height: calc(var(--vh) - 144px);overflow: auto;">
        <div  id="bodyContainer" loading="加载中">
            <div  id="container" >

            </div>
        </div>
    </div>

    <mdui-navigation-bar value="/" style="position: relative" class="bg">
        <mdui-navigation-bar-item icon="notes" value="/">缘分</mdui-navigation-bar-item>
        <mdui-navigation-bar-item icon="person" value="/my">我的</mdui-navigation-bar-item>
    </mdui-navigation-bar>
</div>
<script>
    window.isGuest = {$guest};
    window.isUser = {$isUser};
    window.isAdmin = {$isAdmin};
    window.isSuperAdmin = {$isSuperAdmin};
</script>
<script id="script"> </script>
</body>
</html>


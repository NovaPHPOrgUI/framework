<!doctype html>
<html lang="zh-CN" class="mdui-theme-light scroll-line">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no"/>
    <meta name="renderer" content="webkit"/>
    <title id="title">{$title}</title>
    {include file="publicHeader.tpl"}
    <style>

        #search-button:hover {
            background-color: rgba(var(--mdui-color-on-surface-dark) / 0.08);
        }


    </style>
    <style id="style"></style>
</head>

<body class="bg">


<mdui-layout lass="scroll-line" >
    <mdui-top-app-bar class="banner position-fixed" scroll-behavior="elevate" scroll-target=".layout-main">
        <div class="container d-flex title-container p-0">
            <mdui-button-icon icon="menu" class="d-none" id="navigation-drawer-switch"></mdui-button-icon>
            <a href="/" class="d-flex items-center gap-3 h-100 no-underline" style="color: inherit;">
                <img src="/_images/icons/webapp/android-chrome-192x192.png" alt="{$title}" class="logo h-100 w-auto" width="192" height="192"/>
                <span class="brand-title">{$title}</span>
            </a>
            <div class="flex-1"></div>

            <!-- 桌面端导航菜单 -->
            <div class="desktop-nav d-flex  gap-2">
                {if isset($nav)}
                    {foreach $nav as $navItem}
                        {if isset($navItem.children)}
                            <!-- 带下拉菜单的导航项 -->
                            <mdui-dropdown>
                                <mdui-button slot="trigger" variant="text"
                                        {if isset($navItem.icon)}
                                            icon="{$navItem.icon}"
                                        {/if}
                                             end-icon="arrow_drop_down">
                                    {$navItem.text}
                                </mdui-button>
                                <mdui-menu>
                                    {foreach $navItem.children as $subItem}
                                        {if isset($subItem.children)}
                                            <!-- 二级下拉菜单 -->
                                            <mdui-menu-item
                                                    {if isset($subItem.icon)}
                                                        icon="{$subItem.icon}"
                                                    {/if}
                                                    end-icon="arrow_right">
                                                {$subItem.text}
                                                <mdui-menu slot="submenu">
                                                    {foreach $subItem.children as $subSubItem}
                                                        <mdui-menu-item
                                                                {if isset($subSubItem.link)}

                                                                    {if str_starts_with($subSubItem.link,'http')}
                                                                        end-icon="open_in_new"
                                                                        href="{$subSubItem.link}"
                                                                        target="_blank"
                                                                    {else}
                                                                        data-pjax-item data-href="{$subSubItem.link}"
                                                                    {/if}
                                                                {/if}
                                                                {if isset($subSubItem.icon)}
                                                                    icon="{$subSubItem.icon}"
                                                                {/if}
                                                        >
                                                            {$subSubItem.text}
                                                        </mdui-menu-item>
                                                    {/foreach}
                                                </mdui-menu>
                                            </mdui-menu-item>
                                        {else}
                                            <mdui-menu-item
                                                    {if isset($subItem.link)}
                                                        {if str_starts_with($subItem.link,'http')}
                                                            end-icon="open_in_new"
                                                            href="{$subItem.link}"
                                                            target="_blank"
                                                        {else}
                                                            data-pjax-item
                                                            data-href="{$subItem.link}"
                                                        {/if}

                                                    {/if}
                                                    {if isset($subItem.icon)}
                                                        icon="{$subItem.icon}"
                                                    {/if}


                                            >
                                                {$subItem.text}
                                            </mdui-menu-item>
                                        {/if}
                                    {/foreach}
                                </mdui-menu>
                            </mdui-dropdown>
                        {else}
                            <!-- 普通导航链接 -->
                            <mdui-button variant="text"

                                         {if isset($navItem.icon)}icon="{$navItem.icon}"{/if}
                                    {if isset($navItem.link)}
                                        {if str_starts_with($navItem.link,'http')}
                                            end-icon="open_in_new"
                                            href="{$navItem.link}"
                                            target="_blank"
                                        {else}
                                            data-pjax-item data-href="{$navItem.link}"
                                        {/if}
                                    {/if}
                            >

                                {$navItem.text}
                            </mdui-button>
                        {/if}
                    {/foreach}
                {/if}
            </div>

            <!-- 移动端导航菜单 -->
            <div class="mobile-nav d-flex  gap-2">
                <mdui-dropdown>
                    <mdui-button-icon slot="trigger" icon="more_vert"></mdui-button-icon>
                    <mdui-menu>
                        {if isset($nav)}
                            {foreach $nav as $navItem}
                                {if isset($navItem.children)}
                                    <!-- 带子菜单的导航项 -->
                                    <mdui-menu-item>
                                        {if isset($navItem.icon)}
                                        <mdui-icon slot="icon" name="{$navItem.icon}"></mdui-icon>{/if}
                                        {$navItem.text}
                                        {if isset($navItem.badge)}
                                            <mdui-badge slot="end">{$navItem.badge}</mdui-badge>{/if}
                                        <mdui-icon slot="end-icon" name="arrow_right"></mdui-icon>
                                        <mdui-menu slot="submenu">
                                            {foreach $navItem.children as $subItem}
                                                {if isset($subItem.children)}
                                                    <!-- 二级子菜单 -->
                                                    <mdui-menu-item>
                                                        {if isset($subItem.icon)}
                                                        <mdui-icon slot="icon"
                                                                   name="{$subItem.icon}"></mdui-icon>{/if}
                                                        {$subItem.text}
                                                        <mdui-icon slot="end-icon" name="arrow_right"></mdui-icon>
                                                        <mdui-menu slot="submenu">
                                                            {foreach $subItem.children as $subSubItem}
                                                                <mdui-menu-item
                                                                        {if isset($subSubItem.link)}
                                                                    {if str_starts_with($subSubItem.link,'http')}
                                                                        href="{$subSubItem.link}"
                                                                        target="_blank"
                                                                    {else}
                                                                        data-pjax-item data-href="{$subSubItem.link}"
                                                                    {/if}
                                                                        {/if}>
                                                                    {if isset($subSubItem.icon)}
                                                                    <mdui-icon slot="icon"
                                                                               name="{$subSubItem.icon}"></mdui-icon>{/if}
                                                                    {$subSubItem.text}
                                                                    {if isset($subSubItem.link) && str_starts_with($subSubItem.link,'http')}
                                                                        <mdui-icon slot="end-icon"
                                                                                   name="open_in_new"></mdui-icon>
                                                                    {/if}
                                                                </mdui-menu-item>
                                                            {/foreach}
                                                        </mdui-menu>
                                                    </mdui-menu-item>
                                                {else}
                                                    <mdui-menu-item
                                                            {if isset($subItem.link)}
                                                        {if str_starts_with($subItem.link,'http')}
                                                            href="{$subItem.link}"
                                                            target="_blank"
                                                        {else}
                                                            data-pjax-item data-href="{$subItem.link}"
                                                        {/if}
                                                            {/if}>
                                                        {if isset($subItem.icon)}
                                                        <mdui-icon slot="icon"
                                                                   name="{$subItem.icon}"></mdui-icon>{/if}
                                                        {$subItem.text}
                                                        {if isset($subItem.link) && str_starts_with($subItem.link,'http')}
                                                            <mdui-icon slot="end-icon" name="open_in_new"></mdui-icon>
                                                        {/if}
                                                    </mdui-menu-item>
                                                {/if}
                                            {/foreach}
                                        </mdui-menu>
                                    </mdui-menu-item>
                                {else}
                                    <!-- 普通导航项 -->
                                    <mdui-menu-item
                                            {if isset($navItem.link)}
                                        {if str_starts_with($navItem.link,'http')}
                                            href="{$navItem.link}"
                                            target="_blank"
                                        {else}
                                            data-pjax-item data-href="{$navItem.link}"
                                        {/if}
                                            {/if}>
                                        {if isset($navItem.icon)}
                                        <mdui-icon slot="icon" name="{$navItem.icon}"></mdui-icon>{/if}
                                        {$navItem.text}
                                        {if isset($navItem.link) && str_starts_with($navItem.link,'http')}
                                            <mdui-icon slot="end-icon" name="open_in_new"></mdui-icon>
                                        {/if}
                                    </mdui-menu-item>
                                {/if}

                            {/foreach}
                        {/if}
                        <mdui-divider></mdui-divider>
                        <mdui-menu-item href="/">
                            <mdui-icon slot="icon" name="home"></mdui-icon>
                            首页
                        </mdui-menu-item>
                    </mdui-menu>
                </mdui-dropdown>
            </div>


            <!-- 搜索按钮 -->
            <mdui-button-icon icon="search" data-pjax-item data-href="/search" id="search-button" class="ml-2"></mdui-button-icon>

        </div>
    </mdui-top-app-bar>

    <mdui-navigation-drawer open class="navigation-drawer d-none position-fixed" id="navigation-drawer" close-on-overlay-click   >
        <mdui-list class="m-2">
        </mdui-list>
    </mdui-navigation-drawer>
    <mdui-layout-main class="layout-main">
        <div id="bodyContainer">
            <div id="container" class="mt-0">

            </div>
        </div>
        <footer class="no-translate text-center flex-shrink-0 mt-auto" style="min-height: 60px; padding: 20px 0;">© {date('Y')} Ankio. All rights reserved.</footer>
    </mdui-layout-main>
    <mdui-dropdown class="right position-fixed d-flex z-3000">
        <mdui-fab icon="settings" slot="trigger"></mdui-fab>
        <mdui-menu>
            <theme-switcher class="mb-2"></theme-switcher>
            <lang-switcher></lang-switcher>
        </mdui-menu>

    </mdui-dropdown>


</mdui-layout>
<script id="script"></script>
{include file="publicScript.tpl"}
</body>
</html>


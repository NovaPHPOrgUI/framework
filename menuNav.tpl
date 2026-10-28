{function name="renderMenu" items=[] pathPrefix=''}
    {foreach $items as $idx => $node}

        {* 使用基础 if 和字符串拼接(.)，完美绕过原生正则的解析 Bug *}
        {if $pathPrefix == ''}
            {$currentPath = $idx}
        {else}
            {$currentPath = "$pathPrefix-$idx"}
        {/if}

        {* type=section：分组标题，不参与跳转 *}
        {if isset($node.type) && $node.type == 'section'}
            <div class="nav-section">{$node.title}</div>

        {* type=system：默认可折叠的「系统 / 高级」组 *}
        {elseif isset($node.type) && $node.type == 'system' && !empty($node.sub)}
            <details class="nav-system" {if isset($node.open) && $node.open}open{/if}>
                <summary class="nav-system-summary">
                    {if isset($node.icon) && $node.icon != ''}
                        <mdui-icon name="{$node.icon}"></mdui-icon>
                    {/if}
                    <span class="nav-system-title">{$node.title}</span>
                    <mdui-icon name="expand_more" class="nav-system-chevron"></mdui-icon>
                </summary>
                <div class="nav-system-body">
                    {call name="renderMenu" items=$node.sub pathPrefix=$currentPath}
                </div>
            </details>

        {elseif !empty($node.sub)}
            <mdui-collapse>
                <mdui-collapse-item value="item-{$currentPath}">
                    <mdui-list-item slot="header" rounded icon="{$node.icon}">
                        <span>{$node.title}</span>
                        <mdui-icon slot="end-icon" name="keyboard_arrow_left"></mdui-icon>
                    </mdui-list-item>
                    <div class="nav-submenu">
                        {call name="renderMenu" items=$node.sub pathPrefix=$currentPath}
                    </div>
                </mdui-collapse-item>
            </mdui-collapse>
        {else}
            <mdui-list-item
                    rounded
                    icon="{$node.icon}"
                    data-link="{isset($node.url) ? $node.url : '' }"
                    data-pjax="{isset($node.pjax) ? 'true' : 'false'}"
                    data-match="{if isset($node.match)}{$node.match}{/if}">
                {$node.title}
            </mdui-list-item>
        {/if}
    {/foreach}
{/function}

{* 一键渲染！ *}
{call name="renderMenu" items=$menuConfig}

let level = debug ? 'debug' : 'error';
$.logger.setLevel(level);
$.logger.info('App is running in ' + level + ' mode');
// ============================================
// 数据缓存 - 只查询一次DOM
// ============================================
const DOM = {
    drawer: document.querySelector(".navigation-drawer"),
    menuList: $("mdui-list"),
    get menuItems() { return this.menuList.find("mdui-list-item"); },
    get collapseItems() { return this.menuList.find("mdui-collapse"); }
};

// ============================================
// 初始化
// ============================================
const pjaxUtils = new PjaxUtils(true, () => {}, "/404");

// 响应式：小屏幕关闭侧边栏
if (mdui.breakpoint().down("lg")) {
    DOM.drawer.open = false;
}

// ============================================
// 核心逻辑：设置菜单激活状态
// ============================================
function setActive(url) {
    DOM.menuItems.each(function () {
        const $item = $(this);
        const link = $item.data("link");
        const match = $item.data("match");
        const isActive = link === url || (match && new RegExp(match).test(url));
        
        // 设置或移除激活状态
        $item.attr("active", isActive || null);
        
        // 激活时展开父折叠项
        if (isActive) {
            const $collapseItem = $item.parent().parent();
            if ($collapseItem[0]?.tagName === "MDUI-COLLAPSE-ITEM") {
                const collapse = $collapseItem.parent()[0];
                collapse.value = [$collapseItem.attr("value")];
                $(collapse).find("mdui-icon").addClass("rotate-ccw");
            }
        }
    });
}

// ============================================
// 导航处理：消除嵌套的特殊情况
// ============================================
function handleNavigation(element) {
    const $elem = $(element.closest("mdui-list-item"));
    const url = $elem.attr("data-link");
    
    if (!url) return;
    
    const isPjax = $elem.attr("data-pjax") === "true";
    const target = $elem.attr("data-target");
    
    // PJAX跳转
    if (isPjax) {
        pjaxUtils.loadUri(url);
        setActive(url);
        return;
    }
    
    // 普通跳转
    target === "self" ? (window.location.href = url) : window.open(url);
}

// ============================================
// 事件监听
// ============================================
$(document)
    .on("click", "[data-pjax-item]", function () {
        pjaxUtils.loadUri($(this).data("href"));
    })
    .on("click", "mdui-list-item", (e) => handleNavigation(e.target))
    .on("click", "#navigation-drawer-switch", () => {
        DOM.drawer.open = !DOM.drawer.open;
    });

$(document).on("scroll",function () {
    if (document.querySelector("html").scrollTop === 0)$("mdui-top-app-bar").removeAttr("scrolling");
    else $("mdui-top-app-bar").attr("scrolling","");
})
// 折叠面板图标旋转
DOM.collapseItems
    .on("open", (e) => $(e.target).find("mdui-icon").addClass("rotate-ccw"))
    .on("close", (e) => $(e.target).find("mdui-icon").removeClass("rotate-ccw"));

// ============================================
// 页面加载
// ============================================
setActive(window.location.pathname);
pjaxUtils.loadUri(window.location.pathname + window.location.search);

//

$.request.setBaseUrl(baseUri).setOnCode(401,()=>{
    $.toaster.error('登录已过期，请重新登录');
    setTimeout(()=>{
        window.location.href = '/login';
    },1000);
});
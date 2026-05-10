let level = debug ? "debug" : "error";
$.logger.setLevel(level);
$.logger.info("App is running in " + level + " mode");

// ============================================
// 侧边栏管理器（服务端渲染菜单 + PJAX）
// ============================================
class SidebarManager {
    /**
     * @param {InstanceType<typeof PjaxUtils>} pjaxUtils
     */
    constructor(pjaxUtils) {
        this.pjaxUtils = pjaxUtils;
        this.navigationDrawer = $("#navigation-drawer");
        this.expandTimer = null;
        this.$list = null;
        this.initCollapseListeners();
    }

    initCollapseListeners() {
        const self = this;
        this.$list = this.navigationDrawer.find("mdui-list");
        this.$list
            .on("open", (e) => {
                const $panel = $(e.target).closest("mdui-collapse-item");
                $panel
                    .children('[slot="header"]')
                    .find('mdui-icon[slot="end-icon"]')
                    .addClass("rotate-ccw");
            })
            .on("close", (e) => {
                const $panel = $(e.target).closest("mdui-collapse-item");
                $panel
                    .children('[slot="header"]')
                    .find('mdui-icon[slot="end-icon"]')
                    .removeClass("rotate-ccw");
            })
            .on("click", "mdui-list-item", function (e) {
                self.handleNavigation(e.target);
            });
    }

    /**
     * @param {EventTarget | null} element
     */
    handleNavigation(element) {
        const closest = element && element.closest ? element.closest("mdui-list-item") : null;
        if (!closest) {
            return;
        }
        const $elem = $(closest);
        const url = $elem.attr("data-link");

        if (!url) {
            return;
        }

        const isPjax = $elem.attr("data-pjax") === "true";
        const target = $elem.attr("data-target");

        if (isPjax) {
            this.pjaxUtils.loadUri(url);
            this.updateActiveState(url);
            return;
        }

        target === "self" ? (window.location.href = url) : window.open(url);
    }

    /** 非手风琴 Collapse：初始 value 置空，避免子组默认全开 */
    initDefaultCollapseValues() {
        this.navigationDrawer.find("mdui-collapse").each(function () {
            const c = this;
            if (!c.hasAttribute("accordion")) {
                c.value = [];
            }
        });
    }

    /**
     * 根据当前 URL 更新 data-link / data-match 命中项，并展开父级折叠
     * @param {string} url
     */
    updateActiveState(url) {
        const $list = this.navigationDrawer.find("mdui-list");
        $list.find("mdui-list-item[active]").removeAttr("active");

        /** @type {JQuery} */
        let $activeItem = $();
        $list.find("mdui-list-item[data-link]").each(function () {
            const $item = $(this);
            const link = $item.data("link");
            const match = $item.data("match");
            const isActive =
                link === url || (match && String(match).length > 0 && new RegExp(match).test(url));
            if (isActive) {
                $item.attr("active", "");
                $activeItem = $item;
            }
        });

        this.expandActiveParents();

        if ($activeItem.length > 0) {
            this.scrollActiveIntoView($activeItem);
        }
    }

    expandActiveParents() {
        if (this.expandTimer) {
            clearTimeout(this.expandTimer);
        }

        const expand = () => {
            const $activeItem = this.navigationDrawer.find("mdui-list-item[active]").first();
            if ($activeItem.length === 0) {
                this.expandTimer = null;
                return;
            }

            $activeItem.parents("mdui-collapse-item").each(function () {
                const $collapseItem = $(this);
                const value = $collapseItem.attr("value");
                const collapseEl = $collapseItem.parent("mdui-collapse")[0];
                if (!value || !collapseEl) {
                    return;
                }
                if (collapseEl.hasAttribute("accordion")) {
                    collapseEl.value = value;
                } else {
                    const prev = Array.isArray(collapseEl.value)
                        ? collapseEl.value
                        : collapseEl.value != null && collapseEl.value !== ""
                          ? [collapseEl.value]
                          : [];
                    if (prev.indexOf(value) === -1) {
                        collapseEl.value = prev.concat(value);
                    }
                }
            });
            this.expandTimer = null;
        };

        const drawerEl = this.navigationDrawer[0];
        if (
            this.navigationDrawer.css("display") === "none" ||
            (drawerEl && drawerEl.offsetWidth === 0)
        ) {
            expand();
        } else {
            this.expandTimer = setTimeout(expand, 100);
        }
    }

    /**
     * @param {JQuery} $activeItem
     */
    scrollActiveIntoView($activeItem) {
        setTimeout(() => {
            const drawerEl = this.navigationDrawer[0];
            const itemEl = $activeItem[0];
            if (drawerEl && itemEl && drawerEl.offsetWidth > 0) {
                const drawerRect = drawerEl.getBoundingClientRect();
                const itemRect = itemEl.getBoundingClientRect();
                const scrollTop = drawerEl.scrollTop;
                const targetScroll =
                    scrollTop +
                    (itemRect.top - drawerRect.top) -
                    drawerRect.height / 2 +
                    itemRect.height / 2;
                drawerEl.scrollTo({
                    top: targetScroll,
                    behavior: "smooth",
                });
            }
        }, 150);
    }

    /**
     * 清理事件与定时器（PJAX 全页替换或旧路由场景可调用）
     */
    clean() {
        if (this.expandTimer) {
            clearTimeout(this.expandTimer);
            this.expandTimer = null;
        }
        if (this.$list) {
            this.$list.off("open");
            this.$list.off("close");
            this.$list.off("click");
        }
    }
}

// ============================================
// 初始化
// ============================================
const pjaxUtils = new PjaxUtils(true, () => {}, "/404");
const sidebarManager = new SidebarManager(pjaxUtils);

const navigationDrawerEl = document.querySelector(".navigation-drawer");

// 响应式：小屏幕关闭侧边栏
if (mdui.breakpoint().down("lg")) {
    if (navigationDrawerEl) {
        navigationDrawerEl.open = false;
    }
}

$(document)
    .on("click", "[data-pjax-item]", function () {
        pjaxUtils.loadUri($(this).data("href"));
    })
    .on("click", "#navigation-drawer-switch", () => {
        if (navigationDrawerEl) {
            navigationDrawerEl.open = !navigationDrawerEl.open;
        }
    });

$(document).on("scroll", function () {
    if (document.querySelector("html").scrollTop === 0) {
        $("mdui-top-app-bar").removeAttr("scrolling");
    } else {
        $("mdui-top-app-bar").attr("scrolling", "");
    }
});

// ============================================
// 页面加载
// ============================================
sidebarManager.initDefaultCollapseValues();

const initialUrl =
    window.location.pathname + window.location.search + window.location.hash;
sidebarManager.updateActiveState(initialUrl);
pjaxUtils.loadUri(initialUrl);

$.request.setBaseUrl(baseUri).setOnCode(401, (response) => {
    $.toaster.error("登录已过期，请重新登录");
    setTimeout(() => {
        window.location.href = response.data || "/login";
    }, 1000);
});

document.body.style.display = "block";

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
        this.$list = null;
        /** @type {ReturnType<typeof setTimeout> | null} */
        this.expandTimer = null;
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
            .on("click", "[data-link]", function () {
                self.handleNavigation(this);
            });
    }

    /**
     * 程序化改 value 时 MDUI 往往不派发 open，补发一个与组件同名的冒泡事件，委托在 mdui-list 上的逻辑才能跑。
     * @param {Element | null | undefined} collapseItemEl
     */
    dispatchCollapseItemOpen(collapseItemEl) {
        if (!collapseItemEl) {
            return;
        }
        collapseItemEl.dispatchEvent(
            new CustomEvent("open", {
                bubbles: true,
                composed: true,
            })
        );
    }

    /**
     * @param {Element} element 带 data-link 的 mdui-list-item（委托绑定的 this）
     */
    handleNavigation(element) {
        const $elem = $(element);
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

    /**
     * 侧边栏高亮匹配用：去掉 query 中的分页参数 page、size，避免翻页后菜单失配。
     * @param {string} url
     * @returns {string}
     */
    normalizeUrlForSidebarMatch(url) {
        if (typeof url !== "string") {
            return "";
        }
        const trimmed = url.trim();
        try {
            const u = new URL(trimmed, window.location.origin);
            u.searchParams.delete("page");
            u.searchParams.delete("size");
            return u.pathname + u.search + u.hash;
        } catch (e) {
            return trimmed;
        }
    }

    /**
     * 与菜单项 active 比较用的最终 key（路径 + 去掉 .md、首尾斜杠，与文档 slug 风格对齐）
     * @param {string} url
     * @returns {string}
     */
    normalizeActiveKey(url) {
        let s = this.normalizeUrlForSidebarMatch(url);
        try {
            s = decodeURIComponent(s);
        } catch (e) {
            /* ignore */
        }
        return s.replace(/\.(md|MD)$/, "").replace(/^\/+/, "").replace(/\/+$/, "");
    }

    /**
     * 根据当前 URL 更新 data-link / data-match 命中项，并展开父级折叠
     * @param {string} url
     */
    updateActiveState(url) {
        const normalizedCurrent = this.normalizeActiveKey(url);
        const $list = this.navigationDrawer.find("mdui-list");
        $list.find("mdui-list-item[active]").removeAttr("active");

        /** @type {JQuery} */
        let $activeItem = $();
        $list.find("mdui-list-item[data-link]").each((_, el) => {
            const $item = $(el);
            const link = $item.data("link");
            const match = $item.data("match");
            const normalizedLink = this.normalizeActiveKey(String(link ?? ""));
            const isActive =
                normalizedLink === normalizedCurrent ||
                (match &&
                    String(match).length > 0 &&
                    new RegExp(match).test(this.normalizeUrlForSidebarMatch(url)));
            if (isActive) {
                $item.attr("active", "");
                $activeItem = $item;
            }
        });

        // 即使抽屉不可见也更新展开状态，打开抽屉时层级正确
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

            $activeItem.parents("mdui-collapse-item").each((_, el) => {
                const $collapseItem = $(el);
                const value = $collapseItem.attr("value");
                const $collapse = $collapseItem.parent("mdui-collapse");

                if (value && $collapse.length > 0) {
                    const currentValue = $collapse.attr("value");
                    /** @type {boolean} */
                    let didOpen = false;
                    if (currentValue) {
                        const values = currentValue.split(" ").filter((v) => v);
                        if (!values.includes(value)) {
                            values.push(value);
                            $collapse.attr("value", values.join(" "));
                            didOpen = true;
                        }
                    } else {
                        $collapse.attr("value", value);
                        didOpen = true;
                    }
                    if (didOpen) {
                        this.dispatchCollapseItemOpen(el);
                    }
                }
            });
            this.expandTimer = null;
        };

        const drawerEl = this.navigationDrawer[0];
        const drawerHidden =
            this.navigationDrawer.css("display") === "none" ||
            this.navigationDrawer.width() === 0 ||
            (drawerEl && drawerEl.offsetWidth === 0);

        if (drawerHidden) {
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
let sidebarManager;
const pjaxUtils = new PjaxUtils((url) => {
    sidebarManager.updateActiveState(url);
}, "/404");
sidebarManager = new SidebarManager(pjaxUtils);

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

const initialUrl = window.location.pathname + window.location.search;
sidebarManager.updateActiveState(initialUrl);
pjaxUtils.loadUri(initialUrl, { history: false });

$.request.setBaseUrl(baseUri).setOnCode(401, (response) => {
    $.toaster.error("登录已过期，请重新登录");
    setTimeout(() => {
        window.location.href = response.data || "/login";
    }, 1000);
});

document.body.style.display = "block";

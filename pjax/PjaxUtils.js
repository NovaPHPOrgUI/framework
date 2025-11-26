/**
 * PJAX工具类
 * 提供页面无刷新加载功能，支持历史记录管理和加载状态控制
 * @file PjaxUtils.js
 * @author License Auto System
 * @version 1.0.0
 */

/*
 * Copyright (c) 2025. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

/**
 * PJAX工具类
 * 管理页面无刷新加载、历史记录和加载状态
 */
class PjaxUtils {
    /**
     * 构造函数
     * @param {boolean} history - 是否启用历史记录
     * @param {Function} complete - 加载完成回调函数
     * @param {string} error - 错误页面路径
     */
    constructor(history, complete, error) {
        const NOOP = function () {};
        const WAIT_INTERVAL = 100;
        /** @type {Array<string>} 需要更新的DOM选择器 */
        this.selectors = ["#title", "#container", "#style", "#script"];
        /** @type {boolean} 是否启用历史记录 */
        this.history = history;
        /** @type {Pjax} PJAX实例 */
        this.pjax = new Pjax({
            elements: "a[href]",
            selectors: this.selectors,
            history: history,
            debug: false,
            cacheBust: false,
        });
        /** @type {boolean} 是否正在加载 */
        this.loading = false;

        const bodyContainer = "#container"

        /** @type {string} 错误页面路径 */
        this.error = error;
        if (!window.pageOnUnLoad) {
            window.pageOnUnLoad = NOOP;
        }
        if (!window.pageLoadFiles) {
            window.pageLoadFiles = [];
        }


        let hasChild = false;
        /**
         * 监听PJAX发送事件
         * 处理页面加载开始时的状态
         */
        document.addEventListener("pjax:send", () => {
            if (this.loading) return;
            this.loading = true;
            try {
                NProgress.start();
                
                $.emitter.off();
                window.pageOnUnLoad();
                window.pageOnLoad = null;
                window.pageOnUnLoad = NOOP;
                window.pageLoadFiles = [];
                window.pageNeedsSidebar = true;
            } catch (e) {
                console.log(e);
            }
        });

        /**
         * 监听PJAX错误事件
         * 处理页面加载失败的情况
         */
        document.addEventListener("pjax:error", (evt) => {
            console.error(evt)
            this.loading = false;
            if (this.pjax.state.href.endsWith(this.error)) {
                $.toaster.error("网络错误");
                return;
            }
            this.loadUri(this.error);
            $.toaster.error("页面加载失败");
        });

        /**
         * 监听PJAX完成事件
         * 处理页面加载完成后的操作
         */
        document.addEventListener("pjax:complete", () => {

            $.logger.debug("pjax:complete");
            complete();

            /**
             * 加载脚本文件
             */
            const onloadScript = () => {
                loader.load(window.pageLoadFiles, () => {
                    NProgress.done();
                    
                    // 根据页面声明统一处理侧边栏显示/隐藏
                    const $drawerSwitch = $("#navigation-drawer-switch");
                    const $drawer = $("#navigation-drawer");
                    if (window.pageNeedsSidebar) {
                        $drawerSwitch.removeClass("d-none");
                        $drawer.removeClass("d-none");
                    } else {
                        $drawerSwitch.addClass("d-none");
                        $drawer.addClass("d-none");
                    }
                    
                    if (typeof window.pageOnLoad === "function") {
                        window.pageOnLoad();
                    }
                    this.loading = false;
                });
            };

            /**
             * 等待页面加载函数准备就绪
             */
            const wait = () => {
                if (window.pageOnLoad === null) {
                    setTimeout(wait, WAIT_INTERVAL);
                    $.logger.debug("wait pageOnLoad")
                    return;
                }
                onloadScript();
            };

            wait();

        });
        return this;
    }

    /**
     * 加载指定URI
     * @param {string} uri - 要加载的URI路径
     */
    loadUri(uri) {
        if (!this.history) {
            location.hash = uri;
        } else {
            this.pjax.loadUrl(uri);
        }
    }
}
/**
 * PJAX 工具类
 * 通过局部替换页面锚点实现无刷新导航，配合后端 X-PJAX 请求返回 HTML 片段
 * @file PjaxUtils.js
 */

/**
 * PJAX 页面加载器
 * 负责请求页面片段、切换 DOM、管理 History 与页面生命周期
 */
class PjaxUtils {
    /** @type {string[]} 后端返回 HTML 中需要替换的目标选择器 */
    static SELECTORS = ["#title", "#container", "#style", "#script"];

    /**
     * @param {(url: string) => void} complete - 导航完成后的回调（成功或展示错误页后触发，参数为目标 URI）
     * @param {string} error - 错误页路径，请求失败时加载（如 /404）
     */
    constructor(complete, error) {
        const NOOP = function () {};

        /** @type {(url: string) => void} 导航完成回调 */
        this.onComplete = complete;
        /** @type {string | null} 用户意图访问的 URI（加载错误页内容时不改写） */
        this.navigationHref = null;
        /** @type {boolean} 是否正在加载页面 */
        this.loading = false;
        /** @type {boolean} 是否正在恢复至错误页（防止错误页再次失败时死循环） */
        this.recovering = false;
        /** @type {string} 错误页路径 */
        this.error = error;
        /** @type {{ href: string | null, history: boolean }} 当前请求状态 */
        this.state = { href: null, history: true };
        /**
         * 悬停预取的单槽。只留最近一个：预取的是整页片段，留多份既压后端也会读到过期内容。
         * @type {{ href: string | null, html: Promise<string> | null }}
         */
        this.prefetched = { href: null, html: null };
        /** @type {number} History state 递增 uid */
        this.uid = 0;
        /** @type {Request} 专用 HTTP 客户端（带 PJAX 请求头、静默错误 toast） */
        this.http = new Request()
            .setSilent()
            .setBaseUrl(window.baseUri || "")
            .setHeaders({
                "X-Requested-With": "XMLHttpRequest",
                "X-PJAX": "true",
                "X-PJAX-Selectors": JSON.stringify(PjaxUtils.SELECTORS),
            });

        if (!window.pageOnUnLoad) {
            window.pageOnUnLoad = NOOP;
        }
        if (!window.pageLoadFiles) {
            window.pageLoadFiles = [];
        }

        this.seedHistory();
        window.addEventListener("popstate", (event) => this.onPopState(event));
    }

    /**
     * 将相对/绝对地址规范为 pathname + search + hash
     * @param {string} href
     * @returns {string}
     */
    normalizeHref(href) {
        const url = new URL(href, window.location.origin);
        return url.pathname + url.search + url.hash;
    }

    /**
     * 当前地址栏对应的规范 URI
     * @returns {string}
     */
    currentHref() {
        return window.location.pathname + window.location.search + window.location.hash;
    }

    /**
     * 首次进入时为当前页写入 PJAX history state，避免后退落到无 state 的条目
     */
    seedHistory() {
        const url = this.currentHref();
        if (window.history.state?.url) {
            return;
        }
        window.history.replaceState(
            { url, uid: 0, scrollPos: [0, 0] },
            document.title,
            window.location.href
        );
        this.uid = 0;
    }

    /**
     * 生成下一个 History uid
     * @returns {number}
     */
    nextUid() {
        this.uid += 1;
        return this.uid;
    }

    /**
     * 开始加载：显示进度条、清理旧页面状态
     */
    beginLoad() {
        this.loading = true;
        try {
            NProgress.start();
            $.emitter.off();
            window.pageOnUnLoad();
            window.pageOnLoad = null;
            window.pageOnUnLoad = function () {};
            window.pageLoadFiles = [];
            window.pageNeedsSidebar = true;
        } catch (e) {
            $.logger.error(e);
        }
    }

    /**
     * 请求或 DOM 切换失败时的处理：提示用户并加载错误页内容（地址栏保持失败的目标 URI）
     */
    handleError() {
        const failedHref = this.navigationHref || this.state.href || "";

        if (failedHref.endsWith(this.error)) {
            this.loading = false;
            NProgress.done();
            this.recovering = false;
            $.toaster.error("网络错误");
            return;
        }

        if (this.recovering) {
            this.loading = false;
            NProgress.done();
            return;
        }

        this.recovering = true;
        this.loading = false;
        $.toaster.error("页面加载失败");
        this.loadUrl(this.error, { history: false, recover: true });
    }

    /**
     * 页面切换成功：等待子页声明 pageOnLoad，加载 pageLoadFiles 后执行初始化
     */
    handleSuccess() {
        const WAIT_INTERVAL = 100;

        this.recovering = false;
        $.logger.debug("pjax success");
        this.onComplete(this.navigationHref || this.currentHref());

        const onloadScript = () => {
            loader.load(window.pageLoadFiles, () => {
                NProgress.done();

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

                if (window.mainAppLoading) {
                    window.mainAppLoading.close();
                    window.mainAppLoading = null;
                }
            });
        };

        const wait = () => {
            if (window.pageOnLoad === null) {
                setTimeout(wait, WAIT_INTERVAL);
                $.logger.debug("wait pageOnLoad");
                return;
            }
            onloadScript();
        };

        wait();
    }

    /**
     * 加载指定 URL 的 PJAX 片段并切换页面
     * @param {string} href - 目标地址（相对或绝对路径）
     * @param {{ history?: boolean, scrollPos?: number[], recover?: boolean }} [options]
     *   - history: 为 false 时不写入 History
     *   - scrollPos: 后退时恢复滚动
     *   - recover: 为 true 表示内部加载错误页，不更新 navigationHref / 地址栏
     */
    loadUrl(href, options = {}) {
        // mdui 的 $.ajax 返回裸 Promise，无法中止在途请求，故导航期间直接忽略新的跳转
        if (this.loading) {
            return;
        }

        const history = options.history !== false;
        const recover = options.recover === true;
        const targetHref = this.normalizeHref(href);

        this.state = { href: targetHref, history };

        if (!recover) {
            this.navigationHref = targetHref;
            if (history && targetHref !== this.currentHref()) {
                this.pushHistory(targetHref);
            }
        }

        this.beginLoad();

        // seed 片段本就属于当前文档，不是新到达的页面，不复位视口
        const seed = this.takeSeed();
        const html = seed === null ? this.takeHtml(targetHref) : Promise.resolve(seed);

        html.then((text) => {
            this.switchContent(text);
            if (seed === null) {
                const [x, y] = Array.isArray(options.scrollPos) ? options.scrollPos : [0, 0];
                window.scrollTo(x, y);
            }
            this.handleSuccess();
        }).catch((e) => {
            $.logger.error(e);
            this.handleError();
        });
    }

    /**
     * 取出首屏 seed 并消费掉：服务端把当前页片段直出进 <template id="page">，省去首屏请求
     * @returns {string | null} 无 seed 时返回 null
     */
    takeSeed() {
        const seed = document.getElementById("page");
        if (!seed || seed.tagName !== "TEMPLATE") {
            return null;
        }
        const html = seed.innerHTML;
        seed.remove();
        return html;
    }

    /**
     * 取目标片段：命中悬停预取则复用，否则实时请求。取走即清槽，不做缓存。
     * @param {string} targetHref - 已规范化的目标地址
     * @returns {Promise<string>}
     */
    takeHtml(targetHref) {
        const slot = this.prefetched;
        this.prefetched = { href: null, html: null };
        return slot.href === targetHref ? slot.html : this.fetchHtml(targetHref);
    }

    /**
     * 发起一次 PJAX 片段请求
     * @param {string} targetHref - 已规范化的目标地址
     * @returns {Promise<string>}
     */
    fetchHtml(targetHref) {
        return new Promise((resolve, reject) => {
            this.http.get(
                targetHref,
                {},
                resolve,
                (status) => reject(new Error(`PJAX request failed: ${targetHref} (${status})`)),
                { dataType: "html" }
            );
        });
    }

    /**
     * 悬停预取：提前发起请求占住单槽，点击同一地址时直接复用，省掉一次往返
     * @param {string} uri - 目标 URI（相对或绝对路径）
     */
    prefetch(uri) {
        if (!uri) {
            return;
        }
        const targetHref = this.normalizeHref(uri);
        if (targetHref === this.prefetched.href) {
            return;
        }

        const html = this.fetchHtml(targetHref);
        this.prefetched = { href: targetHref, html };
        // 预取失败静默清槽，点击时按正常流程重发
        html.catch(() => {
            if (this.prefetched.html === html) {
                this.prefetched = { href: null, html: null };
            }
        });
    }

    /**
     * 将 HTML 片段中的锚点元素替换到当前文档，并执行其中的脚本
     * @param {string} html - 后端返回的 PJAX HTML 片段
     */
    switchContent(html) {
        const doc = document.implementation.createHTMLDocument("pjax");
        doc.documentElement.innerHTML = html;

        PjaxUtils.SELECTORS.forEach((selector) => {
            const newEl = doc.querySelector(selector);
            const oldEl = document.querySelector(selector);
            if (!newEl || !oldEl) {
                throw new Error(`PJAX switch failed: missing ${selector}`);
            }
            oldEl.outerHTML = newEl.outerHTML;
        });

        PjaxUtils.SELECTORS.forEach((selector) => {
            const el = document.querySelector(selector);
            if (el) {
                this.executeScripts(el);
            }
        });
    }

    /**
     * 执行元素自身及其子节点中的 script 标签
     * @param {Element} el - 已插入文档的目标元素
     */
    executeScripts(el) {
        if (el.tagName.toLowerCase() === "script") {
            this.evalScript(el);
        }
        el.querySelectorAll("script").forEach((script) => {
            this.evalScript(script);
        });
    }

    /**
     * 通过动态创建 script 节点执行脚本（outerHTML 替换不会自动执行 script）
     * @param {HTMLScriptElement} el - 源 script 元素
     */
    evalScript(el) {
        // 只执行可执行脚本；application/json 等数据块浏览器原生不执行，
        // pjax 也必须跳过，否则会把数据（如 #page-data 的 JSON）当 JS 执行而报错
        const type = (el.type || "").toLowerCase();
        if (type && type !== "text/javascript" && type !== "application/javascript" && type !== "module") {
            return;
        }
        const code = el.text || el.textContent || el.innerHTML || "";
        const src = el.src || "";
        if (code.includes("document.write")) {
            return;
        }

        const script = document.createElement("script");
        script.type = "text/javascript";
        if (el.id) {
            script.id = el.id;
        }
        if (src) {
            script.src = src;
            script.async = false;
        } else if (code) {
            script.text = code;
        } else {
            return;
        }

        const parent = el.parentNode || document.head || document.body;
        parent.appendChild(script);
        script.remove();
    }

    /**
     * 将导航写入 History，并在离开当前页前保存滚动位置
     * @param {string} href - 目标地址
     */
    pushHistory(href) {
        const url = this.normalizeHref(href);
        const scrollPos = [window.scrollX, window.scrollY];

        if (window.history.state) {
            window.history.replaceState(
                { ...window.history.state, scrollPos },
                document.title,
                window.location.href
            );
        }

        const uid = this.nextUid();
        window.history.pushState({ url, uid, scrollPos: [0, 0] }, document.title, url);
    }

    /**
     * 浏览器前进/后退：按 history state 或地址栏 URL 重新加载
     * @param {PopStateEvent} event
     */
    onPopState(event) {
        const url = event.state?.url ?? this.currentHref();
        const scrollPos = Array.isArray(event.state?.scrollPos) ? event.state.scrollPos : undefined;
        this.loadUrl(url, { history: false, scrollPos });
    }

    /**
     * 对外导航入口：同 pathname 仅更新 query 参数时不发请求
     * @param {string} uri - 目标 URI（可含 query / hash）
     * @param {{ history?: boolean }} [options] - 透传给 loadUrl
     */
    loadUri(uri, options = {}) {
        try {
            const targetUrl = new URL(uri, window.location.origin);
            const targetHref = this.normalizeHref(uri);
            if (window.location.pathname === targetUrl.pathname && $.url) {
                $.logger.debug(`[Skip] same path ${uri}`);
                $.url.setUri(targetHref);
                $.emitter.emit("pjax:prevented", targetUrl.searchParams);
                return;
            }
        } catch (e) {
            $.logger.error("Invalid URI:", e);
        }

        this.loadUrl(uri, options);
    }
}

/**
 * 图片加载组件
 * 提供懒加载、占位图、渐变动画等图片加载功能
 * @file ImageLoader.js
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
 * 图片加载组件类
 * 继承自HTMLElement，提供自定义图片加载元素
 */
class ImageLoader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.src = this.getAttribute("src");
        this.placeholder = this.getAttribute("placeholder") || "/static/framework/imageLoader/default.png";
        this.defaultImage = this.getAttribute('default') || "/static/framework/imageLoader/default.png";
        this.fadeDuration = parseInt(this.getAttribute('duration'), 10) || 300;
        this.noRefer = this.hasAttribute('no-refer');
        this.hasLoaded = false;
        this.isLoading = false;
    }

    connectedCallback() {
        this.render();
        this.topImage = this.shadowRoot.querySelector('.top');
        this.bottomImage = this.shadowRoot.querySelector('.bottom');

        // 如果是 base64 或已存在，直接显示
        if (this.src && this.src.startsWith("data:image")) {
            this.showImage(this.src);
        }
    }

    render() {
        // 增加 alt 属性支持，提升可访问性
        const altText = this.getAttribute("alt") || "image";

        this.shadowRoot.innerHTML = `
            <style>
            :host { display: block; width: 100%; position: relative; overflow: hidden; min-height: 10px; }
            img { width: 100%; height: 100%; object-fit: cover; transition: opacity ${this.fadeDuration}ms; }
            .top { position: relative; z-index: 2; }
            .bottom { position: absolute; left: 0; top: 0; z-index: 1; opacity: 0; }
            .loaded { opacity: 1; }
            </style>
            <img class="top" src="${this.placeholder}" alt="" ${this.noRefer ? 'referrerpolicy="no-referrer"' : ''}>
            <img class="bottom" alt="${altText}" ${this.noRefer ? 'referrerpolicy="no-referrer"' : ''}>
        `;
    }

    /**
     * 核心方法：由外部 lazyLoadImages 触发
     */
    triggerLoad() {
        if (this.hasLoaded || this.isLoading || !this.src) return;

        this.isLoading = true;

        this.bottomImage.onload = () => {
            this.isLoading = false;
            this.bottomImage.classList.add('loaded');
            this.topImage.style.opacity = '0';
            this.hasLoaded = true;
            setTimeout(() => { this.topImage.style.display = 'none'; }, this.fadeDuration);
        };

        this.bottomImage.onerror = () => {
            this.isLoading = false;
            this.bottomImage.src = this.defaultImage;
            this.bottomImage.classList.add('loaded');
        };

        this.bottomImage.src = this.src;
    }

    /**
     * 终止正在进行的图片加载（元素离开视口或被删除时调用）
     */
    abortLoad() {
        if (!this.isLoading) return;
        this.bottomImage.onload = null;
        this.bottomImage.onerror = null;
        // 必须使用空的 Data URI 才能在浏览器底层真正阻断网络请求
        this.bottomImage.src = 'data:,';
        this.isLoading = false;
    }

    showImage(src) {
        this.bottomImage.src = src;
        this.bottomImage.classList.add('loaded');
        this.topImage.style.display = 'none';
        this.hasLoaded = true;
    }
}

customElements.define('image-loader', ImageLoader);

/**
 * 自动化图片懒加载调度器 (性能优化版)
 * 职责：
 * 1. 监听常规 DOM 树的增删，处理懒加载。
 * 2. 处理划入加载、划出取消。
 * 3. 暴露 scan API，供 Shadow DOM 自定义组件在渲染完成后主动调用。
 */
function initAutoLazyLoad(selector = 'image-loader', options = { threshold: 0.1, rootMargin: '50px' }) {

    // 1. 交叉观察器：处理视口的进入与离开
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            const el = e.target;
            if (e.isIntersecting) {
                el.triggerLoad?.();
                if (el.hasLoaded) io.unobserve(el);
            } else {
                el.abortLoad?.(); // 划走时触发取消
            }
        });
    }, options);

    // 2. 核心遍历函数：统一处理绑定(isAdd=true)与清理(isAdd=false)
    const processTree = (root, isAdd) => {
        if (!root || !root.querySelectorAll) return;

        // 收集自身（如果匹配）及所有匹配的后代元素
        const targets = root.matches?.(selector) ? [root, ...root.querySelectorAll(selector)] : root.querySelectorAll(selector);

        targets.forEach(el => {
            if (isAdd) {
                io.observe(el);
            } else {
                io.unobserve(el);
                el.abortLoad?.(); // 元素被删除时，立即中断进行中的网络请求
            }
        });
    };

    // 3. 全局 DOM 变化回调
    const handleMutations = mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => processTree(node, true));
            m.removedNodes.forEach(node => processTree(node, false));
        });
    };

    // 4. 启动时扫描 body
    processTree(document.body, true);

    // 5. 启动全局常规 DOM 监听
    const globalMo = new MutationObserver(handleMutations);
    globalMo.observe(document.body, { childList: true, subtree: true });

    // 6. 暴露公共 API
    return {
        /**
         * 允许外部自定义组件主动传入其 shadowRoot 进行扫描绑定
         * @param {HTMLElement|ShadowRoot} rootNode
         */
        scan: (rootNode) => processTree(rootNode, true),

        /**
         * 销毁并回收资源
         */
        destroy: () => {
            io.disconnect();
            globalMo.disconnect();
        }
    };
}

// 执行初始化，并挂载到全局变量，方便其他 Web Component 调用
window.lazyLoader = initAutoLazyLoad("image-loader");
$.emitter.on("imageLoader", (shadowRoot) => {
    lazyLoader.scan(shadowRoot)
});
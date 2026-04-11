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
        this.shadowRoot.innerHTML = `
            <style>
            :host { display: block; width: 100%; position: relative; overflow: hidden; min-height: 10px; }
            img { width: 100%; height: 100%; object-fit: cover; transition: opacity ${this.fadeDuration}ms; }
            .top { position: relative; z-index: 2; }
            .bottom { position: absolute; left: 0; top: 0; z-index: 1; opacity: 0; }
            .loaded { opacity: 1; }
            </style>
            <img class="top" src="${this.placeholder}" alt="placeholder">
            <img class="bottom" alt="real-image">
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
     * 终止正在进行的图片加载（元素离开视口时调用）
     */
    abortLoad() {
        if (!this.isLoading) return;
        this.bottomImage.onload = null;
        this.bottomImage.onerror = null;
        this.bottomImage.src = '';
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
 * 全局懒加载调度器
 * @param {string} selector 选择器
 * @param {Object} options IntersectionObserver 配置
 */
/**
 * 自动化图片懒加载调度器
 * 自动监听 DOM 中新增的 selector 元素并处理懒加载
 */
function initAutoLazyLoad(selector = 'image-loader', options = { threshold: 0.1, rootMargin: '50px' }) {

    // 1. 创建交叉观察器 (视口监听)
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;
            if (entry.isIntersecting) {
                // 进入视口：触发加载
                if (typeof el.triggerLoad === 'function') {
                    el.triggerLoad();
                }
                // 已加载完成则无需继续观察
                if (el.hasLoaded) {
                    io.unobserve(el);
                }
            } else {
                // 离开视口：若仍在加载中则终止，等待下次进入视口再重新加载
                if (typeof el.abortLoad === 'function') {
                    el.abortLoad();
                }
            }
        });
    }, options);

    // 2. 定义观察函数：将符合条件的元素加入 io 观察队列
    const observeElements = (nodes) => {
        nodes.forEach(node => {
            // 确保是元素节点且符合选择器
            if (node.nodeType === 1) {
                if (node.matches(selector)) {
                    io.observe(node);
                }
                // 如果新插入的是容器，递归查找内部的 image-loader
                node.querySelectorAll(selector).forEach(child => io.observe(child));
            }
        });
    };

    // 3. 立即处理当前已存在的元素
    observeElements(document.querySelectorAll(selector));

    // 4. 创建突变观察器 (DOM 新增监听)
    const mo = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                observeElements(mutation.addedNodes);
            }
        });
    });

    // 开始监听整个 body 的子树变化
    mo.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 返回停止监听的方法（可选）
    return () => {
        io.disconnect();
        mo.disconnect();
    };
}

// 执行初始化
initAutoLazyLoad("image-loader");
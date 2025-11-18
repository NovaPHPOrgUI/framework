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
    /**
     * 构造函数
     * 初始化组件属性和Shadow DOM
     */
    constructor() {
        super();
        /** @type {string} 图片源地址 */
        this.imageSrc = this.getAttribute("src");

        /** @type {string} 默认图片地址 */
        this.defaultImage = this.getAttribute('default') || "/static/components/imageLoader/default.png";
        /** @type {number} 渐变动画持续时间（毫秒） */
        this.fadeDuration = parseInt(this.getAttribute('duration'), 10) || 300;
        this.attachShadow({mode: 'open'});
        /** @type {Loading} 加载状态实例 */
        this.loading = new Loading(this.shadowRoot);
        /** @type {string} 占位图片地址 */
        this.placeholder  = this.getAttribute("placeholder") || "/static/components/imageLoader/default.png";
        /** @type {boolean} 是否已加载完成 */
        this.hasLoaded = false;
        /** @type {IntersectionObserver|null} 视口观察器 */
        this.observer = null;
        /** @type {AbortController|null} 用于取消图片加载的控制器 */
        this.abortController = null;
        /** @type {boolean} 是否正在加载中 */
        this.isLoading = false;
        /** @type {number} 离开视口后延迟取消的时间（毫秒） */
        this.cancelDelay = parseInt(this.getAttribute('cancel-delay'), 10) || 500;
        /** @type {number|null} 取消加载的延迟定时器 */
        this.cancelTimer = null;
    }

    /**
     * 组件连接到DOM时调用
     * 初始化组件结构和事件绑定
     */
    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
            :host {
                display: block;
                width: 100%;
                position: relative;
            }
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                position: absolute;
                left: 0;
                top: 0;
                -webkit-transition: opacity ${this.fadeDuration}ms;
                transition: opacity ${this.fadeDuration}ms;
            }
            img.top {
                position: relative;
                z-index: 1;
            }
            img.bottom {
                z-index: 0;
                opacity: 0;
                -webkit-transition: opacity ${this.fadeDuration}ms;
                transition: opacity ${this.fadeDuration}ms;
            }
            img.bottom.loaded {
                opacity: 1;
            }
            </style>
            <img class="top" src="${this.placeholder}" loading="lazy" alt="placeholder">
            <img class="bottom" loading="lazy" alt="image">
        `;

        /** @type {HTMLImageElement} 顶部占位图片元素 */
        this.topImage = this.shadowRoot.querySelector('img.top');
        /** @type {HTMLImageElement} 底部实际图片元素 */
        this.bottomImage = this.shadowRoot.querySelector('img.bottom');

        const initialSrc = this.getAttribute('src') || this.imageSrc || '';
        if(initialSrc.startsWith("data:image")){
            this.topImage.style.opacity = 0;
            this.bottomImage.style.opacity = 1;
            this.bottomImage.src = initialSrc;
            return;
        }

        // 将真实图片地址保存到 dataset，等待进入可视区域后再设置 src 触发加载
        this.bottomImage.dataset.src = initialSrc;

        // 使用现代API - IntersectionObserver
        this.setupIntersectionObserver();

        /**
         * 图片加载成功事件处理
         */
        this.bottomImage.onload = () => {
            this.hasLoaded = true;
            this.isLoading = false;
            this.bottomImage.classList.add('loaded');
            this.topImage.style.display = 'none';
            // 加载完成后清理资源
            this.cleanupAbortController();
        };

        /**
         * 图片加载失败事件处理
         */
        this.bottomImage.onerror = () => {
            this.hasLoaded = true;
            this.isLoading = false;
            this.topImage.src = this.defaultImage;
            // 加载失败后清理资源
            this.cleanupAbortController();
        };
    }

    /**
     * 设置IntersectionObserver监听元素进入视口
     */
    setupIntersectionObserver() {
        // 检查浏览器支持
        if (!window.IntersectionObserver) {
            // 降级到立即加载
            this.loadImage();
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 进入视口 - 取消任何待执行的取消操作
                    this.clearCancelTimer();
                    if (!this.hasLoaded && !this.isLoading) {
                        this.loadImage();
                    }
                } else {
                    // 离开视口 - 延迟取消加载
                    if (this.isLoading && !this.hasLoaded) {
                        this.scheduleCancelLoading();
                    }
                }
            });
        }, {
            // 元素进入视口就开始加载，不需要完全可见
            threshold: 0.1,
            // 提前50px开始加载，优化用户体验
            rootMargin: '50px'
        });

        this.observer.observe(this);
    }

    /**
     * 加载图片
     */
    loadImage() {
        if (this.hasLoaded || this.isLoading) return;
        
        const src = this.bottomImage && this.bottomImage.dataset ? this.bottomImage.dataset.src : '';
        if (!src) return;

        this.isLoading = true;
        
        // 创建AbortController用于取消请求
        this.abortController = new AbortController();
        
        // 创建新的Image对象来预加载，避免直接设置src导致无法取消
        const img = new Image();
        
        const handleLoad = () => {
            if (!this.abortController?.signal.aborted) {
                this.bottomImage.src = src;
            }
            cleanup();
        };
        
        const handleError = () => {
            if (!this.abortController?.signal.aborted) {
                this.bottomImage.onerror();
            }
            cleanup();
        };
        
        const handleAbort = () => {
            this.isLoading = false;
            cleanup();
        };
        
        const cleanup = () => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            if (this.abortController) {
                this.abortController.signal.removeEventListener('abort', handleAbort);
            }
        };
        
        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);
        
        if (this.abortController) {
            this.abortController.signal.addEventListener('abort', handleAbort);
        }
        
        img.src = src;
    }

    /**
     * 安排取消加载（延迟执行）
     */
    scheduleCancelLoading() {
        this.clearCancelTimer();
        this.cancelTimer = setTimeout(() => {
            this.cancelLoading();
        }, this.cancelDelay);
    }

    /**
     * 清除取消定时器
     */
    clearCancelTimer() {
        if (this.cancelTimer) {
            clearTimeout(this.cancelTimer);
            this.cancelTimer = null;
        }
    }

    /**
     * 取消图片加载
     */
    cancelLoading() {
        if (this.abortController && this.isLoading && !this.hasLoaded) {
            this.abortController.abort();
            this.cleanupAbortController();
        }
    }

    /**
     * 清理AbortController资源
     */
    cleanupAbortController() {
        if (this.abortController) {
            this.abortController = null;
        }
    }

    /**
     * 组件从DOM断开时调用
     * 清理观察器资源
     */
    disconnectedCallback() {
        // 组件销毁时清理所有资源
        this.clearCancelTimer();
        this.cancelLoading();
        
        if (this.observer) {
            try { 
                this.observer.unobserve(this);
                this.observer.disconnect(); 
            } catch(e) {}
            this.observer = null;
        }
    }
}

/**
 * 注册自定义图片加载元素
 */
customElements.define('image-loader', ImageLoader);
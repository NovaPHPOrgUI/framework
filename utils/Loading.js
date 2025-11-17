/**
 * 加载动画工具类
 * 提供淡入淡出效果和加载动画功能
 * @file Loading.js
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
 * 淡入淡出效果工具对象
 * 提供元素的淡入和淡出动画效果
 */
let fade = {

    /**
     * 淡出效果
     * @param {HTMLElement} container - 要淡出的容器元素
     * @param {Function} callback - 淡出完成后的回调函数
     */
    out(container, callback) {
        if (container === null) {
            if (callback) {
                callback();
            }
            return;
        }
        container.classList.add("fade-leave-active");
        if (callback) {
            setTimeout(function () {
                callback();
            }, 500);
        }
    },
    
    /**
     * 淡入效果
     * @param {HTMLElement} container - 要淡入的容器元素
     * @param {Function} callback - 淡入完成后的回调函数
     */
    in(container, callback) {
        if (container === null) {
            if (callback) {
                callback();
            }
            return;
        }
        container.classList.remove("fade-leave-active");
        container.classList.add("fade-enter");
        setTimeout(function () {
            container.classList.remove("fade-enter");
            container.classList.add("fade-enter-active");
            if (callback) {
                setTimeout(function () {
                    callback();
                }, 500); // 修复：应该是500ms而不是5000ms
            }
        }, 10);
    },
};

/** @type {Object} 全局淡入淡出工具对象 */
$.fade = fade;

/**
 * 加载动画类
 * 提供加载状态显示和进度管理功能
 */
class Loading {
    /**
     * 构造函数
     * @param {HTMLElement|string} container - 容器元素或选择器
     * @param {string} text - 加载提示文字，默认为空字符串
     */
    constructor(container, text = "") {
        try {
            if (typeof container === "string") {
                container = document.querySelector(container);
            }
            /** @type {HTMLElement} 容器元素 */
            this.container = container;
            /** @type {HTMLElement} 遮罩层元素 */
            this.overlayElement = document.createElement("div");
            this.overlayElement.className = "loading-overlay fade-leave-active";

            // 使用 mdui-circular-progress
            /** @type {HTMLElement} 加载进度条元素 */
            this.loadingElement = document.createElement("mdui-circular-progress");
            this.loadingElement.setAttribute("indeterminate", "");
            this.loadingElement.setAttribute("max", 100)
            this.loadingElement.style.position = "absolute";
            if (text === ""){
                this.loadingElement.style.top = "calc(50%)";
            }else{
                this.loadingElement.style.top = "calc(50% - 20px)";
            }
            this.loadingElement.style.left = "50%";
            this.loadingElement.style.transform = "translate(-50%, -50%)";

            // 创建文字元素
            /** @type {HTMLElement} 文字显示元素 */
            this.textElement = document.createElement("div");
            this.textElement.className = "loading-text";
            this.setText(text);

            this.overlayElement.appendChild(this.loadingElement);
            this.overlayElement.appendChild(this.textElement);
        } catch (e) {
            console.error("Loading 构造函数错误:", e);
        }
    }

    /**
     * 设置进度值
     * @param {number} progress - 进度值（0-100）
     */
    setProgress(progress) {
        this.loadingElement.setAttribute("value", progress);
    }

    /**
     * 设置加载提示文字
     * @param {string} text - 提示文字
     */
    setText(text) {
        this.textElement.textContent = text;
    }

    /**
     * 显示加载动画
     */
    show() {
        try {
            this.container.appendChild(this.overlayElement);
            fade.in(this.overlayElement);
        } catch (e) {
            console.error("Loading show 方法错误:", e);
        }
    }

    /**
     * 关闭加载动画
     */
    close() {
        try {
            let that = this;
            fade.out(this.overlayElement, function () {
                window.dispatchEvent(new Event("resize"));
                $.emitter.emit("translate:start");
                that.overlayElement.remove();
            });
        } catch (e) {
            console.error("Loading close 方法错误:", e);
        }
    }
}


// 属性驱动的Loading管理（封装在IIFE中，不污染全局）
(function() {
    const map = new WeakMap();

    function show(el,text) {
        if (map.has(el)) return;
        
        // 确保元素有定位，否则遮罩层会飞掉
        const pos = getComputedStyle(el).position;
        if (pos === 'static') el.style.position = 'relative';
        
        const instance = new Loading(el, el.getAttribute('loading') || text || '');
        map.set(el, instance);
        instance.show();
    }

    function hide(el) {
        const instance = map.get(el);
        if (instance) {
            instance.close();
            map.delete(el);
        }
    }

    function update(el, text) {
        const instance = map.get(el);
        if (instance) instance.setText(text);
    }

    // 监听DOM变化
    new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.type === 'childList') {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.hasAttribute?.('loading')) show(node);
                        node.querySelectorAll?.('[loading]').forEach(show);
                    }
                });
            }
            if (m.type === 'attributes') {
                m.target.hasAttribute('loading') ? show(m.target) : hide(m.target);
            }
        });
    }).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['loading']
    });

    // jQuery插件
    if (typeof $ !== 'undefined' && $.fn) {
        $.fn.closeLoading = function() {
            return this.each(function() {
                this.removeAttribute('loading');
                hide(this);
            });
        };
        
        $.fn.updateLoading = function(text) {
            return this.each(function() {
                update(this, text);
            });
        };

        $.fn.showLoading = function(text) {
            return this.each(function() {
                show(this, text);
            });
        };
    }

    // 初始化已有元素
    document.querySelectorAll('[loading]').forEach(show);
})();

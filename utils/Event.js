/**
 * 事件发射器工具类
 * 提供自定义事件和DOM事件管理功能，支持事件注册、触发和清理
 * @file Event.js
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
 * 事件发射器类
 * 提供自定义事件和DOM事件的管理功能
 */
class EventEmitter {
    /**
     * 构造函数
     * 初始化事件存储对象
     */
    constructor() {
        /** @type {Object} 存储自定义事件及其对应的回调函数 */
        this.events = {};
        /** @type {Object} 存储DOM事件及其对应的回调函数 */
        this.domEvents = {};
    }

    /**
     * 获取当前路径
     * @returns {string} 当前路径
     */
    path() {
       if (typeof nova!=="undefined")return nova.getPath();
       return ""
    }

    /**
     * 获取上一个路径
     * @returns {string} 上一个路径
     */
    lastPath(){
        if (typeof nova!=="undefined")return nova.lastUrl;
        return ""
    }

    /**
     * 注册事件监听器
     * @param {string|HTMLElement} event 事件名称或DOM对象
     * @param {string|Function} listener 监听器或者DOM事件类型
     * @param {?Function} listener2 监听器（仅用于DOM事件）
     * @returns {EventEmitter} 返回当前实例，支持链式调用
     */
    on(event, listener, listener2 = null) {
        if (typeof event !== 'string') {
            // 处理DOM事件
            let target = event;
            let eventType = listener;
            let eventListener = listener2;

            const path = this.path();
            if (!this.domEvents[path]) {
                this.domEvents[path] = [];
            }
            this.domEvents[path].push({ target, eventType, eventListener });

            target.addEventListener(eventType, eventListener);
            return this;
        }

        // 处理自定义事件
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push({
            listener,
            path: this.path()
        });
        return this;
    }

    /**
     * 注册一次性事件监听器
     * @param {string} event 事件名称
     * @param {Function} listener 监听器函数
     * @returns {EventEmitter} 返回当前实例，支持链式调用
     */
    once(event, listener) {
        const onceWrapper = (...args) => {
            listener(...args);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
        return this;
    }

    /**
     * 取消事件监听器
     * @param {string} event 事件名称
     * @param {Function} listener 监听器函数
     * @returns {EventEmitter} 返回当前实例，支持链式调用
     */
    off(event, listener) {
        let currentPath = this.lastPath();
        if (!event && currentPath!=="") {
            // 移除当前路径的所有事件

            if (this.domEvents[currentPath]) {
                this.domEvents[currentPath].forEach(({ target, eventType, eventListener }) => {
                    target.removeEventListener(eventType, eventListener);
                });
                delete this.domEvents[currentPath];
            }

            for (let key in this.events) {
                this.events[key] = this.events[key].filter(l => l.path !== currentPath);
            }
            $.logger.debug('remove all listeners => currentPath: ' + currentPath);
            return this;
        }

        // 处理自定义事件
        if (this.events[event]) {
            if (!listener) {
                this.events[event] = this.events[event].filter(l => l.path !== currentPath);
            } else {
                this.events[event] = this.events[event].filter(l => l.listener !== listener || l.path !==currentPath);
            }
        }

        // 处理DOM事件
        if (this.domEvents[currentPath]) {
            if (listener) {
                this.domEvents[currentPath] = this.domEvents[currentPath].filter(({ target, eventType, eventListener }) => {
                    if (event === eventType && listener === eventListener) {
                        target.removeEventListener(eventType, eventListener);
                        return false;
                    }
                    return true;
                });
            } else {
                this.domEvents[currentPath].forEach(({ target, eventType, eventListener }) => {
                    target.removeEventListener(eventType, eventListener);
                });
                delete this.domEvents[currentPath];
            }
        }

        return this;
    }

    /**
     * 移除所有事件监听器
     * @param {string} event 事件名称，如果不提供则移除所有事件
     * @returns {EventEmitter} 返回当前实例，支持链式调用
     */
    removeAllListeners(event) {
        if (!event) {
            // 清空所有事件
            let currentPath = this.path();
            if (this.domEvents[currentPath]) {
                this.domEvents[currentPath].forEach(({ target, eventType, eventListener }) => {
                    target.removeEventListener(eventType, eventListener);
                });
                delete this.domEvents[currentPath];
            }
            this.events = {};
        } else {
            if (this.domEvents[event]) {
                let item = this.domEvents[event];
                if (item.target && item.event && item.listener) {
                    item.target.removeEventListener(item.event, item.listener);
                }
                delete this.domEvents[event];
            }
            if (this.events[event]) {
                delete this.events[event];
            }
        }
        return this;
    }

    /**
     * 获取指定事件的所有监听器
     * @param {string} event 事件名称
     * @returns {Array<Function>} 监听器函数数组
     */
    listeners(event) {
        return (this.events[event] || []).map(l => l.listener);
    }

    /**
     * 触发事件
     * @param {string} event 事件名称
     * @param {...any} args 传递给监听器的参数
     * @returns {EventEmitter} 返回当前实例，支持链式调用
     */
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(l => l.listener(...args));
        }
        return this;
    }
}

/**
 * 使用示例
 * $.emitter.on('customEvent', function(data) {
 *     console.log('Custom event triggered:', data);
 * });
 * $.emitter.emit('customEvent', {message: 'Hello'});
 */

/** @type {EventEmitter} 全局事件发射器实例 */
$.emitter = new EventEmitter();

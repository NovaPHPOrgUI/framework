/*
 * Copyright (c) 2025. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

class EventEmitter {
    constructor() {
        // 存储自定义事件及其对应的回调函数
        this.events = {};
        // 存储 DOM 事件及其对应的回调函数
        this.domEvents = {};
    }

    // 获取当前路径
    path() {
       if (typeof nova!=="undefined")return nova.getPath();
       return ""
    }

    lastPath(){
        if (typeof nova!=="undefined")return nova.lastUrl;
        return ""
    }

    // 注册事件
    /**
     * @param {string|HTMLElement} event 事件名称或 DOM 对象
     * @param {string} listener 监听器或者 DOM 事件类型
     * @param {?function} listener2 监听器（仅用于 DOM 事件）
     * @returns {EventEmitter}
     */
    on(event, listener, listener2 = null) {
        if (typeof event !== 'string') {
            // 处理 DOM 事件
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

    // 注册一次性事件
    once(event, listener) {
        const onceWrapper = (...args) => {
            listener(...args);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
        return this;
    }

    // 取消事件
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

        // 处理 DOM 事件
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

    // 取消所有事件
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

    // 获取事件监听器
    listeners(event) {
        return (this.events[event] || []).map(l => l.listener);
    }

    // 触发事件
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(l => l.listener(...args));
        }
        return this;
    }
}


// 使用示例
//
$.emitter = new EventEmitter();

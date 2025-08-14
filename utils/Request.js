/**
 * 请求工具类
 * 提供HTTP请求封装功能，支持多种请求方法和状态码回调
 * @file Request.js
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
 * 请求工具类
 * 提供HTTP请求封装，支持GET、POST、PUT、DELETE等方法
 */
class Request {
    /**
     * 构造函数
     * 初始化请求配置和状态
     */
    constructor() {
        /** @type {string} 基础URL */
        this.baseUrl = '';
        /** @type {Object} 请求头配置 */
        this.headers = {};
        /** @type {Object} 请求状态 */
        this.state = {
            success: false,
            error: false,
            response: null,
            errorMessage: null
        };
        /** @type {Object} 状态码回调函数映射 */
        this.codeCallBack = {

        };
    }

    /**
     * 设置基础URL
     * @param {string} baseUrl - 基础URL地址
     * @returns {Request} 返回当前实例，支持链式调用
     */
    setBaseUrl(baseUrl) {
        this.baseUrl = baseUrl;
        return this;
    }

    /**
     * 设置请求头
     * @param {Object} headers - 请求头对象
     * @returns {Request} 返回当前实例，支持链式调用
     */
    setHeaders(headers) {
        this.headers = headers;
        return this;
    }
    
    /**
     * 设置状态码回调函数
     * @param {number} code - 状态码
     * @param {Function} callback - 回调函数
     * @returns {Request} 返回当前实例，支持链式调用
     */
    setOnCode(code,callback){
        this.codeCallBack[code] = callback;
        return this;
    }

    /**
     * 内部AJAX请求方法
     * @param {string} method - 请求方法
     * @param {string} url - 请求URL
     * @param {Object|string} data - 请求数据
     * @param {string} [contentType] - 内容类型
     * @param {Function} [success] - 成功回调
     * @param {Function} [error] - 错误回调
     * @returns {Object} jQuery AJAX对象
     * @private
     */
    _ajax(method, url, data, contentType, success, error) {
        const self = this;

        if(!url.startsWith('http')){
            url = self.baseUrl + url;
        }

        $.logger.info(`Request: ${method} ${url}`);
        $.logger.info(`RequestData: `);
        $.logger.info(data);
        return $.ajax({
            url: url,
            method: method,
            headers: self.headers,
            data: data,
            contentType: contentType,
            success(response, status) {
                $.logger.info(`RequestResult: `);
                $.logger.info(response);
                if (typeof success === 'function') {
                    //判断响应是否为json
                    if (typeof response === 'object') {
                        if (self.codeCallBack[response.code] && typeof self.codeCallBack[response.code] === 'function') {
                            self.codeCallBack[response.code](response);
                        }else{
                            success(response);
                        }
                    } else {
                        success(response);
                    }
                }
            },
            error(xhr,status) {
                if (typeof error === 'function') {
                    error(status);
                }
                $.toaster.error('请求失败');
                $.logger.error(status);
            },
            complete() {

            }
        });
    }

    /**
     * GET请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求参数
     * @param {Function} [success] - 成功回调
     * @param {Function} [error] - 错误回调
     * @returns {Object} jQuery AJAX对象
     */
    get(url, data, success, error) {
        return this._ajax('GET', url, data, 'application/x-www-form-urlencoded', success, error);
    }

    /**
     * POST表单请求
     * @param {string} url - 请求URL
     * @param {Object} data - 表单数据
     * @param {Function} [success] - 成功回调
     * @param {Function} [error] - 错误回调
     * @returns {Object} jQuery AJAX对象
     */
    postForm(url, data, success, error) {
        return this._ajax('POST', url, data, 'application/x-www-form-urlencoded', success, error);
    }

    /**
     * POST JSON请求
     * @param {string} url - 请求URL
     * @param {Object} data - JSON数据
     * @param {Function} [success] - 成功回调
     * @param {Function} [error] - 错误回调
     * @returns {Object} jQuery AJAX对象
     */
    postJson(url, data, success, error) {
        return this._ajax('POST', url, JSON.stringify(data), 'application/json', success, error);
    }

    /**
     * PUT请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @param {Function} [success] - 成功回调
     * @param {Function} [error] - 错误回调
     * @returns {Object} jQuery AJAX对象
     */
    put(url, data, success, error) {
        return this._ajax('PUT', url, data, 'application/x-www-form-urlencoded', success, error);
    }

    /**
     * DELETE请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @param {Function} [success] - 成功回调
     * @param {Function} [error] - 错误回调
     * @returns {Object} jQuery AJAX对象
     */
    delete(url, data, success, error) {
        return this._ajax('DELETE', url, data, 'application/x-www-form-urlencoded', success, error);
    }

    /**
     * 并发请求
     * @param {Array<Object>} requests - 请求配置数组
     * @param {Function} callback - 完成回调函数
     */
    all(requests, callback) {
        const ajaxPromises = requests.map(req => {
            return this._ajax(req.method, req.url, req.data, req.contentType);
        });

        Promise.all(ajaxPromises)
            .then(responses => {
                if (typeof callback === 'function') {
                    callback(null, responses);
                }
            })
            .catch(err => {
                if (typeof callback === 'function') {
                    callback(err);
                }
            });
    }

    /**
     * 直接进行 SSE 请求（最小封装）
     * 使用原生 EventSource，不依赖额外的流式实现
     * 注意：EventSource 不支持自定义请求头，如需自定义头部请改为后端下发 Cookie 方式
     * @param {string} url - SSE 接口相对或绝对 URL
     * @param {Object} [options]
     * @param {Object} [options.params] - 追加的查询参数对象（会被序列化到 URL）
     * @param {boolean} [options.withCredentials=false] - 是否携带凭据（Cookie）
     * @param {function(Event):void} [options.onOpen] - 连接建立回调
     * @param {function(any|string, MessageEvent):void} [options.onMessage] - 默认消息回调（data自动尝试JSON.parse）
     * @param {Object} [options.eventHandlers] - 自定义事件处理器对象，键为事件名，值为处理函数
     * @param {boolean} [options.autoReconnect=true] - 是否允许自动重连（false 时在错误发生后立即关闭）
     * @param {function(Event):void} [options.onError] - 错误回调
     * @returns {EventSource} - 原生 EventSource 实例，可直接调用 close()
     */
    sse(url, options = {}) {
        const self = this;
        const {
            params = undefined,
            withCredentials = false,
            onOpen = undefined,
            onMessage = undefined,
            eventHandlers = {},
            onError = undefined,
            autoReconnect = true
        } = options;

        // 规范化URL并拼接查询参数
        let requestUrl = url;
        if (!requestUrl.startsWith('http')) {
            requestUrl = self.baseUrl + requestUrl;
        }
        if (params && typeof params === 'object') {
            const usp = new URLSearchParams();
            Object.keys(params).forEach(k => {
                const v = params[k];
                usp.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
            });
            const qs = usp.toString();
            if (qs) {
                requestUrl += (requestUrl.includes('?') ? '&' : '?') + qs;
            }
        }

        $.logger.info(`Request(SSE): GET ${requestUrl}`);

        const es = new EventSource(requestUrl, { withCredentials });

        // 处理数据的通用函数
        const processEventData = (evt, eventType = 'message') => {
            const data = evt && typeof evt.data === 'string' ? evt.data : '';
            if (data === '' || data === '[DONE]') {
                return;
            }
            try {
                const maybeJson = JSON.parse(data);
                return { data: maybeJson, raw: data, eventType, event: evt };
            } catch (e) {
                return { data: data, raw: data, eventType, event: evt };
            }
        };

        if (typeof onOpen === 'function') {
            es.addEventListener('open', (evt) => {
                onOpen(evt);
            });
        }

        // 默认消息处理器
        if (typeof onMessage === 'function') {
            es.onmessage = (evt) => {
                const processed = processEventData(evt, 'message');
                if (processed) {
                    onMessage(processed.data, processed.event, processed.eventType);
                }
            };
        }

        // 自定义事件处理器
        if (eventHandlers && typeof eventHandlers === 'object') {
            Object.keys(eventHandlers).forEach(eventName => {
                const handler = eventHandlers[eventName];
                if (typeof handler === 'function') {
                    es.addEventListener(eventName, (evt) => {
                        const processed = processEventData(evt, eventName);
                        if (processed) {
                            handler(processed.data, processed.event, processed.eventType);
                        }
                    });
                }
            });
        }

        es.onerror = (evt) => {
            if (!autoReconnect) {
                try { es.close(); } catch (e) {}
            }
            if (typeof onError === 'function') {
                onError(evt);
            }
        };

        return es;
    }
}

/**
 * 使用示例
 * $.request.get('/api/data', {}, function(response) {
 *     console.log(response);
 * });
 */

/** @type {Request} 全局请求工具实例 */
$.request = new Request();

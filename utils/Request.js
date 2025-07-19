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
     * @param {string} contentType - 内容类型
     * @param {Function} success - 成功回调
     * @param {Function} error - 错误回调
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
     * @param {Function} success - 成功回调
     * @param {Function} error - 错误回调
     * @returns {Object} jQuery AJAX对象
     */
    get(url, data, success, error) {
        return this._ajax('GET', url, data, 'application/x-www-form-urlencoded', success, error);
    }

    /**
     * POST表单请求
     * @param {string} url - 请求URL
     * @param {Object} data - 表单数据
     * @param {Function} success - 成功回调
     * @param {Function} error - 错误回调
     * @returns {Object} jQuery AJAX对象
     */
    postForm(url, data, success, error) {
        return this._ajax('POST', url, data, 'application/x-www-form-urlencoded', success, error);
    }

    /**
     * POST JSON请求
     * @param {string} url - 请求URL
     * @param {Object} data - JSON数据
     * @param {Function} success - 成功回调
     * @param {Function} error - 错误回调
     * @returns {Object} jQuery AJAX对象
     */
    postJson(url, data, success, error) {
        return this._ajax('POST', url, JSON.stringify(data), 'application/json', success, error);
    }

    /**
     * PUT请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @param {Function} success - 成功回调
     * @param {Function} error - 错误回调
     * @returns {Object} jQuery AJAX对象
     */
    put(url, data, success, error) {
        return this._ajax('PUT', url, data, 'application/x-www-form-urlencoded', success, error);
    }

    /**
     * DELETE请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @param {Function} success - 成功回调
     * @param {Function} error - 错误回调
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
}

/**
 * 使用示例
 * $.request.get('/api/data', {}, function(response) {
 *     console.log(response);
 * });
 */

/** @type {Request} 全局请求工具实例 */
$.request = new Request();

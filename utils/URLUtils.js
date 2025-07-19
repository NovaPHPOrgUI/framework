/**
 * URL工具类
 * 提供URL参数操作和浏览器历史管理功能
 * @file URLUtils.js
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
 * URL工具类
 * 提供URL参数获取、设置、删除和浏览器历史管理功能
 */
class URLUtils {
    /**
     * 获取指定参数的值
     * @param {string} param - 参数名
     * @returns {string|null} 参数值，如果不存在则返回null
     */
     getParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    /**
     * 更新或添加参数，并更新浏览器的URL
     * @param {string} param - 参数名
     * @param {string} value - 参数值
     * @param {boolean} updateHistory - 是否在浏览器历史中添加一条记录，默认为false
     */
     setParam(param, value, updateHistory = false) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        const newUrl = url.toString();

        if (updateHistory) {
            history.pushState(null, '', newUrl);
        } else {
            history.replaceState(null, '', newUrl);
        }
    }

    /**
     * 删除指定参数，并更新浏览器的URL
     * @param {string} param - 参数名
     * @param {boolean} updateHistory - 是否在浏览器历史中添加一条记录，默认为false
     */
     deleteParam(param, updateHistory = false) {
        const url = new URL(window.location);
        url.searchParams.delete(param);
        const newUrl = url.toString();

        if (updateHistory) {
            history.pushState(null, '', newUrl);
        } else {
            history.replaceState(null, '', newUrl);
        }
    }

    /**
     * 获取所有URL参数作为对象
     * @returns {Object} 包含所有URL参数的对象
     */
     getAllParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        urlParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

    /**
     * 设置完整的URI路径
     * @param {string} uri - 要设置的URI路径
     * @param {boolean} updateHistory - 是否在浏览器历史中添加一条记录，默认为false
     */
     setUri(uri, updateHistory = false){
        if (updateHistory) {
            history.pushState(null, '', uri);
        } else {
            history.replaceState(null, '', uri);
        }
    }
}

/** @type {URLUtils} 全局URL工具实例 */
$.url = new URLUtils();
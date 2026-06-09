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
     * @returns {URLSearchParams}
     */
    _searchParams() {
        return new URLSearchParams(window.location.search);
    }

    /**
     * 写入地址栏，并保留 PJAX history state 中的 url 字段
     * @param {URL | string} target - URL 对象或 pathname+search+hash
     * @param {boolean} [updateHistory=false] - true 时 pushState，否则 replaceState
     * @private
     */
    _applyLocation(target, updateHistory = false) {
        const url = target instanceof URL ? target : new URL(target, window.location.origin);
        const href = url.pathname + url.search + url.hash;
        const state = window.history.state
            ? { ...window.history.state, url: href }
            : null;

        if (updateHistory) {
            history.pushState(state, "", href);
        } else {
            history.replaceState(state, "", href);
        }
    }

    /**
     * 获取指定参数的值
     * @param {string} param - 参数名
     * @returns {string|null} 参数值，如果不存在则返回null
     */
    getParam(param) {
        return this._searchParams().get(param);
    }

    /**
     * 更新或添加参数，并更新浏览器的URL
     * @param {string} param - 参数名
     * @param {string} value - 参数值
     * @param {boolean} [updateHistory=false] - 是否在浏览器历史中添加一条记录
     */
    setParam(param, value, updateHistory = false) {
        const url = new URL(window.location);
        if (value == null || value.length === 0) {
            url.searchParams.delete(param);
        } else {
            url.searchParams.set(param, value);
        }
        this._applyLocation(url, updateHistory);
    }

    /**
     * 删除指定参数，并更新浏览器的URL
     * @param {string} param - 参数名
     * @param {boolean} [updateHistory=false] - 是否在浏览器历史中添加一条记录
     */
    deleteParam(param, updateHistory = false) {
        const url = new URL(window.location);
        url.searchParams.delete(param);
        this._applyLocation(url, updateHistory);
    }

    /**
     * 获取所有URL参数作为对象
     * @returns {Object} 包含所有URL参数的对象
     */
    getAllParams() {
        const params = {};
        this._searchParams().forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

    /**
     * 设置完整的URI路径
     * @param {string} uri - 要设置的URI路径
     * @param {boolean} [updateHistory=false] - 是否在浏览器历史中添加一条记录
     */
    setUri(uri, updateHistory = false) {
        this._applyLocation(uri, updateHistory);
    }
}

/** @type {URLUtils} 全局URL工具实例 */
$.url = new URLUtils();

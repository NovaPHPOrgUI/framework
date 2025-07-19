/**
 * 消息提示工具类
 * 提供不同类型的消息提示功能，包括信息、警告、错误、成功等
 * @file Toaster.js
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
 * 消息提示工具类
 * 提供snackbar消息提示功能，支持不同类型的消息样式
 */
class Toaster {
    /**
     * 创建snackbar消息提示
     * @param {string} message - 消息内容
     * @param {string} color - 消息颜色类型
     * @param {Object} params - 额外参数配置
     */
    createSnackbar(message, color, params = {}) {
        let id = "snackbar" + Math.random().toString(36).substring(2);
        let html = `<mdui-snackbar class="bg-${color}" id="${id}"`;

        let keys = Object.keys(params);
        for (let key of keys) {
            html += ` ${key}="${params[key]}"`;
        }

        html += `>${message}</mdui-snackbar>`;

        let timeout = params["auto-close-delay"] || 5000;

        let snackbarDiv = document.createElement("div");
        snackbarDiv.innerHTML = html;

        let snackbar = snackbarDiv.querySelector("#" + id);
        snackbar.open = true;
        document.body.appendChild(snackbarDiv);
        setTimeout(() => {
            snackbarDiv.remove();
        }, timeout);
    }

    /**
     * 显示信息类型消息
     * @param {string} message - 消息内容
     * @param {Object} params - 额外参数配置
     */
    info(message, params = null) {
        this.createSnackbar(message, "info", params);
        $.logger.info(message);
    }

    /**
     * 显示警告类型消息
     * @param {string} message - 消息内容
     * @param {Object} params - 额外参数配置
     */
    warn(message, params = null) {
        this.createSnackbar(message, "warning", params);
        $.logger.warn(message);
    }

    /**
     * 显示错误类型消息
     * @param {string} message - 消息内容
     * @param {Object} params - 额外参数配置
     */
    error(message, params = null) {
        this.createSnackbar(message, "error", params);
        $.logger.error(message);
    }

    /**
     * 显示成功类型消息
     * @param {string} message - 消息内容
     * @param {Object} params - 额外参数配置
     */
    success(message, params = null) {
        this.createSnackbar(message, "success", params);
        $.logger.success(message);
    }
}

/**
 * 使用示例
 * $.toaster.info("这是一条信息");
 * $.toaster.warn("这是一条警告");
 * $.toaster.error("这是一条错误");
 * $.toaster.success("操作成功");
 */

/** @type {Toaster} 全局消息提示工具实例 */
$.toaster = new Toaster();

/** @type {Function} 全局确认对话框函数 */
$.confirm = mdui.confirm;
/** @type {Function} 全局警告对话框函数 */
$.alert  = mdui.alert;
/** @type {Function} 全局提示输入对话框函数 */
$.prompt = mdui.prompt;

/**
 * 框架启动加载器
 * 初始化全局变量、配置和移动端适配
 * @file bootloader.js
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

/** @type {Object} 全局jQuery对象，指向mdui.$ */
window.$ = mdui.$;
/** @type {Object} 全局jQuery别名 */
window.jQuery = $;

/** @type {string} 当前脚本的完整URL */
const scriptUrl = new URL(document.currentScript.src);

/** @type {string} 脚本目录路径 (e.g., https://example.com/static) */
$.scriptDir = scriptUrl.origin + scriptUrl.pathname.substring(0, scriptUrl.pathname.lastIndexOf("/"))+ '/';

/** @type {string} 基础URI路径 (e.g., https://example.com) */
window.baseUri = scriptUrl.origin ;

/** @type {Object} 全局文件缓存对象 */
if (!window.novaFiles) {
    window.novaFiles = {};
}

/**
 * 页面加载完成后的初始化函数
 * @param {boolean} loading - 是否正在加载状态
 * @returns {boolean} 返回false
 */
window.pageOnLoad = function (loading) {
    return false;
};

/**
 * 页面卸载时的清理函数
 */
window.pageOnUnLoad = function () {
};

/** @type {Array<string>} 页面加载时需要加载的文件列表 */
window.pageLoadFiles = [];

// 适配移动端
let result = vhCheck();
if (result.isNeeded) {
    document.documentElement.style.setProperty(
        `--vh-offset`,
        `${result.offset}px`
    )
}

/** @type {Object} JavaScript文件映射配置 */
window.jsMap = {
    Event: '/framework/utils/Event.js',
    Form: '/framework/utils/Form.js',
    Loader: '/framework/utils/Loader.js',
    Loading: [
        '/framework/utils/Loading.js',
        '/framework/utils/Loading.css'
    ],
    Logger: '/framework/utils/Logger.js',
    Request: '/framework/utils/Request.js',
    Layer: '/framework/utils/Layer.js',
    Toaster: '/framework/utils/Toaster.js',
    URLUtils: '/framework/utils/URLUtils.js',

    DialogForm: [
        '/framework/utils/Form.js',
        "/components/formDialog/DialogForm.js",

        ],
    ChipGroup: "/components/chipGroup/mduiChipGroup.js",
    AreaPicker: "/components/areaPicker/AreaPicker.js",
    ImageViewer: [
        "/components/viewer/ImageViewer.js",
        "/components/viewer/ImageViewer.css",
    ],
    FileUploader: [
        "/components/fileUpload/FileUpload.js",
        "/components/fileUpload/FileUploader.js",
        "/components/fileUpload/File.js",
    ],
    DataTable: [
        "/components/dataTable/Pagination.js",
        "/components/dataTable/gridManager.js",
        "/components/dataTable/datatable.css",
        '/components/dataTable/DataTable.js',
        '/framework/utils/URLUtils.js',
    ],
    Pagination:[
        "/components/dataTable/Pagination.js"
    ],
    DatePicker: "/components/datepicker/datepicker.js",
    Markdown: [
        '/components/markdown/cherry-markdown.min.css',
        '/components/markdown/cherry.css',
        '/components/markdown/cherry-markdown.min.js',
        "/components/markdown/diff.min.js",
        "/components/markdown/Markdown.js",
    ],
    Captcha: "/components/captcha/Captcha.js",
    QrScan:"/components/qrscan/QrScan.js",
    Tree: [
        "/components/tree/Tree.js",
        "/components/tree/Tree.css"
    ],
    ContextMenu: "/components/menu/ContextMenu.js",
}

/** @type {boolean} 调试模式开关 */
window.debug = true;
/** @type {string} 版本号 */
window.version = "";
/**
 * 资源加载器工具类
 * 提供JavaScript和CSS文件的动态加载功能，支持缓存和并发控制
 * @file Loader.js
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
 * 资源加载器
 * 提供JavaScript、CSS和其他资源的动态加载功能
 */
const loader = (function (window, document) {
    /** @type {Object} 已加载资源的缓存对象 */
    const loadedResources = {}; // 改为 {[path]: content}
    /** @type {Object} 正在加载中的资源对象 */
    const inProgressResources = {};
    
    /**
     * 加载单个JavaScript文件
     * @param {string} path - 文件路径
     * @param {Function} callback - 加载完成后的回调函数
     */
    function loadScript(path, callback) {
        if (loadedResources[path]) {
            // 如果已加载，直接调用回调
            callback();
            return;
        }
        if (inProgressResources[path]) {
            // 如果正在加载，等待加载完成后调用回调
            $.waitProp(loadedResources, [path], () => {
                callback();
            });
            return;
        }
        inProgressResources[path] = true;
        // 创建script元素
        const script = document.createElement("script");
        script.src = path + v();
        script.async = true;

        // 加载完成或失败的处理
        script.onload = script.onerror = function () {
            let link = path.replace(baseUri, '');
            $.waitProp(window.novaFiles, [link], () => {
                loadedResources[path] = true;
                inProgressResources[path] = false;
                callback();
            });
        };

        // 添加到文档中
        document.head.appendChild(script);
    }

    /**
     * 加载单个CSS文件
     * @param {string} path - 文件路径
     * @param {Function} callback - 加载完成后的回调函数
     * @param {HTMLElement} element - 要插入样式的元素
     */
    function loadCSS(path, callback, element) {
        if (!element && (loadedResources[path] || inProgressResources[path])) {
            // 如果已加载，直接调用回调
            callback();
            return;
        }
        inProgressResources[path] = true;

        if (element) {
            fetch(path + v())
                .then((res) => res.text())
                .then((data) => {
                    let node = document.createElement("style");
                    node.innerHTML = data;
                    element.appendChild(node);
                    callback();
                });
            return;
        }

        // 创建link元素
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = path;

        // 加载完成或失败的处理
        link.onload = link.onerror = function () {
            loadedResources[path] = true;
            inProgressResources[path] = false;
            callback();
        };
        const existingStyle = document.querySelector('#style');
        existingStyle.parentNode.insertBefore(link, existingStyle);
    }

    /**
     * 构建URI路径数组
     * @param {string[]} paths - 原始路径数组
     * @returns {string[]} 构建后的URI数组
     */
    function buildUris(paths) {
        let uris = [];

        /**
         * 连接URI路径
         * @param {string} path - 路径
         * @returns {string} 完整的URI
         */
        function concatUri(path) {
            if (!path.startsWith("http")) {
                path = ("/" + path).replace(/\/\//g, "/");
                path = $.scriptDir + path;
            }
            return path;
        }

        for (const path of paths) {
            let uri = jsMap[path] || path;
            if (typeof uri != "string") {
                for (let uriElement of uri) {
                    uris.push(concatUri(uriElement));
                }
            } else {
                uris.push(concatUri(uri));
            }
        }
        return uris;
    }

    /**
     * 获取版本号查询参数
     * @returns {string} 版本号查询字符串
     */
    function v() {
        if (window.debug) {
            return "?v=" + new Date().getTime();
        } else {
            return "?v=" + window.version
        }
    }

    /**
     * 加载单个文件（JS或CSS）
     * @param {string} path - 文件路径
     * @param {Function} callback - 加载完成后的回调函数
     * @param {HTMLElement} element - 要插入样式的元素
     */
    function loadFile(path, callback, element) {
        const cssRegex = /\.css(?:\?|#|$)/i;
        const jsRegex = /\.js(?:\?|#|$)/i;

        if (cssRegex.test(path)) {
            loadCSS(path, callback, element);
        } else if (jsRegex.test(path)) {
            loadScript(path, callback);
        } else {
            // 使用Request库加载通用资源
            loadResource(path, callback);
        }
    }

    /**
     * 加载通用资源
     * @param {string} path - 资源路径
     * @param {Function} callback - 加载完成后的回调函数
     */
    function loadResource(path, callback) {
        if (loadedResources[path]) {
            callback(null, loadedResources[path]); // 返回缓存内容
            return;
        }
        if (inProgressResources[path]) {
            $.waitProp(loadedResources, [path], callback);
            return;
        }
        
        inProgressResources[path] = true;
        
        // 使用项目自带的Request库
        $.request.get(path + v(), null,
            (data) => { // success（假设request库回调参数为data）
                loadedResources[path] = data; // 存储实际内容
                callback(null, data);
            },
            (error) => { 
                callback(error);
                inProgressResources[path] = false;
            }
        )
    }

    /**
     * 加载多个文件
     * @param {string[]} paths - 文件路径数组
     * @param {Function} callback - 所有文件加载完成后的回调函数
     * @param {HTMLElement} element - 要插入样式的元素
     */
    function loadFiles(paths, callback, element) {
        let remaining = paths.length;
        // 单个文件加载完成后的处理
        function singleCallback() {
            if (--remaining === 0) {
                callback();
            }
        }

        // 加载每个文件
        paths.forEach(function (path) {
            loadFile(path, singleCallback, element);
        });
    }

    /**
     * 主加载函数
     * @param {(string|string[])} paths - 文件路径或路径数组
     * @param {Function} callback - 加载完成后的回调函数
     * @param {HTMLElement} element - 要插入样式的元素
     */
    function load(paths, callback, element = null) {
        if (typeof paths === "string") {
            paths = [paths];
        }

        if (paths.length === 0) {
            callback();
            return;
        }

        let uris = buildUris(paths);

        if ($.logger) {
            $.logger.debug("Load Modules", uris);
        }

        loadFiles(uris, callback || function () {
        }, element);
    }

    /**
     * 设置预加载资源
     * @param {string[]} datas - 要预加载的资源路径数组
     */
    function setPreload(datas) {
        datas = buildUris(datas);
        datas.forEach((data) => {
            loadedResources[data] = true;
        });
    }

    /**
     * 获取已加载的资源内容
     * @param {string} path - 资源路径
     * @returns {*} 资源内容
     */
    function getResource(path) {
        let uris = buildUris([path]);
        return loadedResources[uris[0]];
    }

    // 返回一个包含加载方法的对象
    return {
        load: load,
        setPreload: setPreload,
        get: getResource // 新增资源获取方法
    };
})(window, document);

/** @type {Function} 全局资源加载函数 */
$.loader = loader.load;
/** @type {Function} 全局资源获取函数 */
$.res = loader.get;
/** @type {Function} 全局预加载函数 */
$.preloader = loader.setPreload;

/**
 * 等待元素出现
 * @param {string} selector - CSS选择器
 * @param {Function} callback - 元素出现后的回调函数
 */
$.waitElement = function (selector, callback) {
    if (document.querySelector(selector)) {
        callback();
        return;
    }
    $.logger && $.logger.debug("Wait waitElement ", selector);
    setTimeout(() => $.waitElement(selector, callback), 100);
}

/**
 * 等待对象属性存在
 * @param {Object} obj - 要检查的对象
 * @param {string|string[]} props - 属性名或属性名数组
 * @param {Function} callback - 属性存在后的回调函数
 * @param {number} count - 当前等待次数
 */
$.waitProp = function (obj, props, callback, count = 0) {
    if (count > 600) {
        $.logger && $.logger.error("Wait Prop Timeout: ", props.join(', '));
        return;
    }
    // 将单个属性转换为数组
    const propsArray = Array.isArray(props) ? props : [props];

    // 检查所有属性是否都存在
    const allPropsExist = propsArray.every(prop => obj[prop]);

    if (!allPropsExist) {
        setTimeout(() => $.waitProp(obj, propsArray, callback, count++), 100);
        //  $.logger && $.logger.debug("Wait Prop: ", propsArray.join(', '));
        return;
    }
    $.logger && $.logger.debug("Successful wait Prop: ", propsArray.join(', '));
    callback();
}

/**
 * 等待类名出现
 * @param {string} className - 类名
 * @param {HTMLElement} parent - 父元素，默认为document
 * @param {Function} callback - 类名出现后的回调函数
 */
$.waitClass = function (className, parent, callback) {
    parent = parent || document
    if (parent.querySelector(className)) {
        callback();
        return;
    }
    setTimeout(() => $.waitClass(className, parent, callback), 100);
    $.logger && $.logger.debug("Wait Class ", className);
}

/**
 * 等待多个对象属性
 * @param {Array<Object>} objProps - 对象属性配置数组
 * @param {Function} callback - 所有属性都存在后的回调函数
 */
$.waitProps = function (objProps, callback) {
    let length = objProps.length;

    /**
     * 单个属性等待完成的回调
     */
    function callbackItems() {
        length--;
        if (length === 0) {
            callback();
        }
    }

    for (const objProp of objProps) {
        $.waitProp(objProp.obj, objProp.props, callbackItems);
    }
}

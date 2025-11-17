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
window.loadedResources = {};
window.inProgressResources = {};
const loader = (function (window, document) {
    /**
     * 给URL添加版本号参数
     * @param {string} url - 原始URL
     * @returns {string} 带版本号的URL
     */
    const addVersion = (url) => url + (url.includes('?') ? '&' : '?') + 'v=' + window.version;
    
    /**
     * 执行回调队列（统一的回调管理）
     * @param {string} path - 资源路径
     * @param {...*} args - 传递给回调的参数
     */
    function fireCallbacks(path, ...args) {
        const callbacks = inProgressResources[path]?.callbacks || [];
        delete inProgressResources[path];
        callbacks.forEach(cb => {
            try {
                cb(...args);
            } catch (e) {
                $.logger?.error('Callback error for', path, e);
            }
        });
    }
    
    /**
     * 添加到回调队列
     * @param {string} path - 资源路径
     * @param {Function} callback - 回调函数
     */
    function queueCallback(path, callback) {
        if (!inProgressResources[path].callbacks) {
            inProgressResources[path].callbacks = [];
        }
        inProgressResources[path].callbacks.push(callback);
    }
    
    /**
     * 加载JavaScript文件
     * @param {string} path - 文件路径
     * @param {Function} callback - 回调函数
     */
    function loadScript(path, callback) {
        if (loadedResources[path]) {
            callback();
            return;
        }
        if (inProgressResources[path]) {
            queueCallback(path, callback);
            return;
        }
        
        inProgressResources[path] = { callbacks: [callback] };
        const script = document.createElement("script");
        script.src = addVersion(path);
        script.async = true;
        script.onload = script.onerror = () => {
            loadedResources[path] = true;
            fireCallbacks(path);
        };
        document.head.appendChild(script);
    }

    /**
     * 加载CSS文件
     * @param {string} path - 文件路径
     * @param {Function} callback - 回调函数
     * @param {HTMLElement} element - 要插入样式的元素
     */
    function loadCSS(path, callback, element) {
        if (!element && (loadedResources[path] || inProgressResources[path])) {
            callback();
            return;
        }
        inProgressResources[path] = true;

        if (element) {
            fetch(addVersion(path))
                .then(res => res.text())
                .then(data => {
                    const node = document.createElement("style");
                    node.innerHTML = data;
                    element.appendChild(node);
                    callback();
                });
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = path;
        link.onload = link.onerror = () => {
            loadedResources[path] = true;
            inProgressResources[path] = false;
            callback();
        };
        document.querySelector('#style').parentNode.insertBefore(link, document.querySelector('#style'));
    }

    /**
     * 加载通用资源
     * @param {string} path - 资源路径
     * @param {Function} callback - 回调函数
     */
    function loadResource(path, callback) {
        if (loadedResources[path]) {
            callback(null, loadedResources[path]);
            return;
        }
        if (inProgressResources[path]) {
            queueCallback(path, callback);
            return;
        }
        
        inProgressResources[path] = { callbacks: [callback] };
        $.request.get(addVersion(path), null,
            (data) => {
                loadedResources[path] = data;
                fireCallbacks(path, null, data);
            },
            (error) => fireCallbacks(path, error)
        );
    }

    /**
     * 构建URI路径数组
     * @param {string[]} paths - 原始路径数组
     * @returns {string[]} 构建后的URI数组
     */
    function buildUris(paths) {
        return paths.flatMap(path => {
            const mapped = jsMap[path] || path;
            const uris = Array.isArray(mapped) ? mapped : [mapped];
            return uris.map(uri => 
                uri.startsWith("http") ? uri : $.scriptDir + uri.replace(/^\/+/, '')
            );
        });
    }

    /**
     * 加载单个文件（根据扩展名分发）
     * @param {string} path - 文件路径
     * @param {Function} callback - 回调函数
     * @param {HTMLElement} element - 要插入样式的元素
     */
    function loadFile(path, callback, element) {
        if (/\.css(?:\?|#|$)/i.test(path)) {
            loadCSS(path, callback, element);
        } else if (/\.js(?:\?|#|$)/i.test(path)) {
            loadScript(path, callback);
        } else {
            loadResource(path, callback);
        }
    }

    /**
     * 按类型和来源分组文件
     * @param {string[]} uris - URI数组
     * @returns {{bundle: {js: string[], css: string[]}, external: string[], loaded: string[]}}
     */
    function groupFiles(uris) {
        const groups = {
            bundle: { js: [], css: [] },
            external: [],
            loaded: []
        };


        
        for (const uri of uris) {
            // 已加载的文件跳过
            if (loadedResources[uri]) {
                groups.loaded.push(uri);
                continue;
            }

            if (!uri.startsWith(window.baseUri)){
                groups.external.push(uri);
                continue;
            }

            
            // 静态资源按类型分组
            if (/\.css(?:\?|#|$)/i.test(uri)) {
                groups.bundle.css.push(uri);
            } else if (/\.js(?:\?|#|$)/i.test(uri)) {
                groups.bundle.js.push(uri);
            } else {
                // 其他资源保持单独加载
                groups.external.push(uri);
            }
        }
        
        return groups;
    }
    
    /**
     * 创建bundle URL
     * @param {string[]} files - 文件路径数组
     * @param {string} type - 文件类型 'js' 或 'css'
     * @returns {string} bundle URL
     */
    function createBundleUrl(files, type) {
        // 移除 scriptDir 前缀和版本参数，只保留相对路径
        const cleanFiles = files.map(f => {
            let path = f.replace($.scriptDir, '').replace(/^\//, '');
            // 移除 /static/ 前缀（如果有）
            path = path.replace(/^static\//, '');
            return path;
        });
        
        const fileParam = cleanFiles.join(',');
        return `/static/bundle?file=${encodeURIComponent(fileParam)}&type=${type}`;
    }
    
    /**
     * 标记bundle中的所有文件为已加载
     * @param {string[]} files - 文件路径数组
     */
    function markBundleLoaded(files) {
        files.forEach(file => {
            loadedResources[file] = true;
        });
    }

    /**
     * 主加载函数
     * @param {(string|string[])} paths - 文件路径或路径数组
     * @param {Function} callback - 回调函数
     * @param {HTMLElement} element - 要插入样式的元素
     */
    function load(paths, callback = () => {}, element = null) {

        paths = Array.isArray(paths) ? paths : [paths];
        
        if (paths.length === 0) {
            callback();
            return;
        }

        const uris = buildUris(paths);

        $.logger.debug("Load Modules", uris);

        // 分组文件
        const groups = groupFiles(uris);
        console.log(groups,uris)
        // 计算总任务数
        let remaining = groups.loaded.length + groups.external.length;
        const hasBundleJs = groups.bundle.js.length > 0;
        const hasBundleCss = groups.bundle.css.length > 0;
        
        // Bundle 模式：多文件合并成1个请求
        if (hasBundleJs && groups.bundle.js.length > 1) {
            remaining += 1;
        } else {
            remaining += groups.bundle.js.length;
        }
        
        if (hasBundleCss && groups.bundle.css.length > 1) {
            remaining += 1;
        } else {
            remaining += groups.bundle.css.length;
        }
        
        // 如果没有需要加载的文件，直接回调
        if (remaining === 0) {
            callback();
            return;
        }

        const singleCallback = () => {
            if (--remaining === 0) callback();
        };
        
        // 已加载文件直接回调
        groups.loaded.forEach(() => singleCallback());
        
        // 加载 JS bundle（多文件合并）
        if (hasBundleJs) {
            if (groups.bundle.js.length > 1) {
                const bundleUrl = createBundleUrl(groups.bundle.js, 'js');
                $.logger?.debug("Load JS Bundle", groups.bundle.js);
                loadScript(bundleUrl, () => {
                    markBundleLoaded(groups.bundle.js);
                    singleCallback();
                });
            } else {
                // 单文件不走bundle
                loadFile(groups.bundle.js[0], singleCallback, element);
            }
        }
        
        // 加载 CSS bundle（多文件合并）
        if (hasBundleCss) {
            if (groups.bundle.css.length > 1) {
                const bundleUrl = createBundleUrl(groups.bundle.css, 'css');
                $.logger?.debug("Load CSS Bundle", groups.bundle.css);
                loadCSS(bundleUrl, () => {
                    markBundleLoaded(groups.bundle.css);
                    singleCallback();
                }, element);
            } else {
                // 单文件不走bundle
                loadFile(groups.bundle.css[0], singleCallback, element);
            }
        }
        
        // 外部资源和其他资源保持单独加载
        groups.external.forEach(path => loadFile(path, singleCallback, element));
    }

    /**
     * 设置预加载资源
     * @param {string[]} datas - 要预加载的资源路径数组
     */
    function setPreload(datas) {
        buildUris(datas).forEach(data => loadedResources[data] = true);
    }

    /**
     * 获取已加载的资源内容
     * @param {string} path - 资源路径
     * @returns {*} 资源内容
     */
    function getResource(path) {
        return loadedResources[buildUris([path])[0]];
    }

    return { load, setPreload, get: getResource };
})(window, document);

/** @type {Function} 全局资源加载函数 */
$.loader = loader.load;
/** @type {Function} 全局资源获取函数 */
$.res = loader.get;
/** @type {Function} 全局预加载函数 */
$.preloader = loader.setPreload;

/**
 * 等待元素出现（使用MutationObserver）
 * @param {string} selector - CSS选择器
 * @param {Function} callback - 元素出现后的回调函数
 */
$.waitElement = function (selector, callback) {
    if (document.querySelector(selector)) {
        callback();
        return;
    }
    
    $.logger?.debug("Wait Element", selector);
    
    const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
            observer.disconnect();
            callback();
        }
    });
    
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => {
        observer.disconnect();
        $.logger?.error("Wait Element Timeout:", selector);
    }, 60000);
}

/**
 * 等待对象属性存在
 * @param {Object} obj - 要检查的对象
 * @param {string|string[]} props - 属性名或属性名数组
 * @param {Function} callback - 属性存在后的回调函数
 * @param {number} count - 当前等待次数
 */
$.waitProp = function (obj, props, callback, count = 0) {
    const propsArray = Array.isArray(props) ? props : [props];

    if (propsArray.every(prop => obj[prop])) {
        callback();
        return;
    }
    
    if (count > 600) {
        $.logger?.error("Wait Prop Timeout:", propsArray.join(', '));
        return;
    }
    
    const next = () => $.waitProp(obj, propsArray, callback, count + 1);
    setTimeout(next, count < 50 ? 50 : 100);
}

/**
 * 等待类名出现（使用MutationObserver）
 * @param {string} className - 类名
 * @param {HTMLElement} parent - 父元素，默认为document
 * @param {Function} callback - 类名出现后的回调函数
 */
$.waitClass = function (className, parent, callback) {
    parent = parent || document;
    
    if (parent.querySelector(className)) {
        callback();
        return;
    }
    
    $.logger?.debug("Wait Class", className);
    
    const observer = new MutationObserver(() => {
        if (parent.querySelector(className)) {
            observer.disconnect();
            callback();
        }
    });
    
    observer.observe(parent, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
    
    setTimeout(() => {
        observer.disconnect();
        $.logger?.error("Wait Class Timeout:", className);
    }, 60000);
}

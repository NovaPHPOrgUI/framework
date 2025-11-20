/**
 * 资源加载器 - 动态加载 JS/CSS/资源文件
 * 支持：缓存、并发控制、文件合并（bundle）
 */

/*
 * Copyright (c) 2025. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

window.loadedResources = {};
window.inProgressResources = {};

const loader = (function (window, document) {
    const addVersion = (url) => url + (url.includes('?') ? '&' : '?') + 'v=' + window.version;
    
    /** 执行并清空回调队列 */
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
    
    /** 加入回调队列 */
    function queueCallback(path, callback) {
        if (!inProgressResources[path].callbacks) {
            inProgressResources[path].callbacks = [];
        }
        inProgressResources[path].callbacks.push(callback);
    }
    
    /** 加载 JavaScript */
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

    /** 加载 CSS */
    function loadCSS(path, callback, element) {
        // element 模式：每次都重新注入（不缓存）
        if (element) {
            fetch(addVersion(path))
                .then(res => res.text())
                .then(data => {
                    const node = document.createElement("style");
                    node.innerHTML = data;
                    element.appendChild(node);
                    callback();
                })
                .catch(err => {
                    $.logger?.error('Load CSS failed', path, err);
                    callback();
                });
            return;
        }

        // 全局模式：使用缓存和并发控制
        if (loadedResources[path]) {
            callback();
            return;
        }
        if (inProgressResources[path]) {
            queueCallback(path, callback);
            return;
        }
        
        inProgressResources[path] = { callbacks: [callback] };
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = addVersion(path);
        link.onload = link.onerror = () => {
            loadedResources[path] = true;
            fireCallbacks(path);
        };
        document.querySelector('#style').parentNode.insertBefore(link, document.querySelector('#style'));
    }

    /** 加载通用资源 */
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

    /** 构建完整 URI 路径 */
    function buildUris(paths) {
        return paths.flatMap(path => {
            const mapped = jsMap[path] || path;
            const uris = Array.isArray(mapped) ? mapped : [mapped];
            return uris.map(uri => 
                uri.startsWith("http") ? uri : $.scriptDir + uri.replace(/^\/+/, '')
            );
        });
    }

    /** 根据扩展名分发加载 */
    function loadFile(path, callback, element) {
        if (/\.css(?:\?|#|$)/i.test(path)) {
            loadCSS(path, callback, element);
        } else if (/\.js(?:\?|#|$)/i.test(path)) {
            loadScript(path, callback);
        } else {
            loadResource(path, callback);
        }
    }

    /** 分组：已加载/可合并/外部资源 */
    function groupFiles(uris) {
        const uniqueUris = [...new Set(uris)];
        const groups = {
            bundle: { js: [], css: [] },
            external: [],
            loaded: [],
            loading:[]
        };

        for (const uri of uniqueUris) {
            if (loadedResources[uri]) {
                groups.loaded.push(uri);
                continue;
            }

            if(inProgressResources[uri]){
                groups.loading.push(uri);
                continue;
            }

            if (!uri.startsWith(window.baseUri)) {
                groups.external.push(uri);
                continue;
            }
            
            if (/\.css(?:\?|#|$)/i.test(uri)) {
                groups.bundle.css.push(uri);
            } else if (/\.js(?:\?|#|$)/i.test(uri)) {
                groups.bundle.js.push(uri);
            } else {
                groups.external.push(uri);
            }
        }
        
        return groups;
    }
    
    /** 创建 bundle URL */
    function createBundleUrl(files, type) {
        const cleanFiles = files.map(f => {
            let path = f.replace($.scriptDir, '').replace(/^\//, '');
            path = path.replace(/^static\//, '');
            return path;
        });
        
        const fileParam = cleanFiles.join(',');
        return `/static/bundle?file=${encodeURIComponent(fileParam)}&type=${type}`;
    }
    
    /** 标记所有文件为已加载 */
    function markBundleLoaded(files) {
        files.forEach(file => {
            loadedResources[file] = true;
        });
    }
    
    /** 预标记文件为加载中（防止重复请求）*/
    function markInProgress(files, shouldSkip) {
        files.forEach(file => {
            if (shouldSkip && shouldSkip(file)) return;
            if (!loadedResources[file] && !inProgressResources[file]) {
                inProgressResources[file] = { callbacks: [] };
            }
        });
    }

    /** 计算需要加载的任务数 */
    function countTasks(groups) {
        let count = groups.loaded.length + groups.external.length;
        
        // Bundle：多文件合并成 1 个请求
        if (groups.bundle.js.length > 1) {
            count += 1;
        } else {
            count += groups.bundle.js.length;
        }
        
        if (groups.bundle.css.length > 1) {
            count += 1;
        } else {
            count += groups.bundle.css.length;
        }
        
        return count;
    }
    
    /** 加载 Bundle 或单文件 */
    function loadBundleOrSingle(files, type, onComplete, element) {
        if (files.length === 0) return;

        const bundleUrl = createBundleUrl(files, type);

        const loader = type === 'js' ? loadScript : loadCSS;
        loader(bundleUrl, () => {
            markBundleLoaded(files);
            onComplete();
        }, element);
    }

    /** 主加载函数 */
    function load(paths, callback = () => {}, element = null) {
        paths = Array.isArray(paths) ? paths : [paths];
        
        if (paths.length === 0) {
            callback();
            return;
        }

        const uris = buildUris(paths);


        const groups = groupFiles(uris);
        $.logger.debug("Load Modules", groups);
        // 预标记所有文件为"加载中"，防止并发重复加载
        markInProgress(groups.bundle.js);
        markInProgress(groups.bundle.css, file => element); // element 模式跳过 CSS 标记
        markInProgress(groups.external, file => element && /\.css(?:\?|#|$)/i.test(file));
        
        // 计算任务数
        let remaining = countTasks(groups);
        if (remaining === 0) {
            callback();
            return;
        }

        const taskDone = () => {
            if (--remaining === 0) callback();
        };
        
        // 已加载
        groups.loaded.forEach(() => taskDone());
        
        // 加载 Bundle
        loadBundleOrSingle(groups.bundle.js, 'js', taskDone, element);

        loadBundleOrSingle(groups.bundle.css, 'css', taskDone, element);
        
        // 外部资源
        groups.external.forEach(path => loadFile(path, taskDone, element));
    }



    return { load };
})(window, document);

$.loader = loader.load;
/** 等待 DOM 元素出现 */
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

/** 等待对象属性存在 */
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

/** 等待类名出现 */
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

//资源加载
const loader = (function (window, document) {
    // 简单的缓存和回调队列
    const loadedResources = {};
    const inProgressResources = {};
    /**
     * 加载单个 JavaScript 文件
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
        // 创建 script 元素
        const script = document.createElement("script");
        script.src = path;
        script.async = true;

        // 加载完成或失败的处理
        script.onload = script.onerror = function () {
            let link = script.src.replace(baseUri, '');
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
     * 加载单个 CSS 文件
     * @param {string} path - 文件路径
     * @param {Function} callback - 加载完成后的回调函数
     * @param element
     */
    function loadCSS(path, callback, element) {
        if (!element && (loadedResources[path] || inProgressResources[path])) {
            // 如果已加载，直接调用回调
            callback();
            return;
        }
        inProgressResources[path] = true;

        if (element) {
            fetch(path)
                .then((res) => res.text())
                .then((data) => {
                    let node = document.createElement("style");
                    node.innerHTML = data;
                    element.appendChild(node);
                    callback();
                });
            return;
        }

        // 创建 link 元素
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

    function buildUris(paths) {
        let uris = [];

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
     * 加载单个文件（JS 或 CSS）
     * @param {string} path - 文件路径
     * @param {Function} callback - 加载完成后的回调函数
     * @param element
     */
    function loadFile(path, callback, element) {


        const cssRegex = /\.css(?:\?|#|$)/i;
        const jsRegex = /\.js(?:\?|#|$)/i;

        if (cssRegex.test(path)) {
            loadCSS(path, callback, element);
        } else if (jsRegex.test(path)) {
            loadScript(path, callback);
        } else {
            throw new Error("Unsupported file type: " + path);
        }
    }

    /**
     * 加载多个文件
     * @param {string[]} paths - 文件路径数组
     * @param {Function} callback - 所有文件加载完成后的回调函数
     * @param element
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
     * @param element
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

    function setPreload(datas) {
        datas = buildUris(datas);
        datas.forEach((data) => {
            loadedResources[data] = true;
        });
        console.log(loadedResources);
    }

    // 返回一个包含加载方法的对象
    return {
        load: load,
        setPreload: setPreload
    };
})(window, document);
$.loader = loader.load;
$.preloader = loader.setPreload;
$.waitElement = function (selector, callback) {
    if (document.querySelector(selector)) {
        callback();
        return;
    }
    setTimeout(() => $.waitElement(selector, callback), 100);
}

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
    $.logger && $.logger.info("Successful wait Prop: ", propsArray.join(', '));
    callback();
}

$.waitClass = function (className, parent, callback) {
    parent = parent || document
    if (parent.querySelector(className)) {
        callback();
        return;
    }
    setTimeout(() => $.waitClass(className, parent, callback), 100);
    //$.logger && $.logger.debug("Wait Class ", className);
}

$.waitProps = function (objProps, callback) {
    let length = objProps.length;

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

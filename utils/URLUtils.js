class URLUtils {
    /**
     * 获取指定参数的值
     * @param {string} param - 参数名
     * @returns {string|null} - 参数值，如果不存在则返回null
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
     * @returns {Object} - 包含所有URL参数的对象
     */
     getAllParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        urlParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

     setUri(uri, updateHistory = false){
        if (updateHistory) {
            history.pushState(null, '', uri);
        } else {
            history.replaceState(null, '', uri);
        }
    }
}

$.url = new URLUtils();
class Request {
    constructor() {
        this.baseUrl = '';
        this.headers = {};
        this.state = {
            success: false,
            error: false,
            response: null,
            errorMessage: null
        };
        this.codeCallBack = {

        };
    }

    setBaseUrl(baseUrl) {
        this.baseUrl = baseUrl;
        return this;
    }

    setHeaders(headers) {
        this.headers = headers;
        return this;
    }
    setOnCode(code,callback){
        this.codeCallBack[code] = callback;
        return this;
    }


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
                        if (this.codeCallBack[response.code] && typeof this.codeCallBack[response.code] === 'function') {
                            this.codeCallBack[response.code](response);
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

    get(url, data, success, error) {
        return this._ajax('GET', url, data, 'application/x-www-form-urlencoded', success, error);
    }

    postForm(url, data, success, error) {
        return this._ajax('POST', url, data, 'application/x-www-form-urlencoded', success, error);
    }

    postJson(url, data, success, error) {
        return this._ajax('POST', url, JSON.stringify(data), 'application/json', success, error);
    }

    put(url, data, success, error) {
        return this._ajax('PUT', url, data, 'application/x-www-form-urlencoded', success, error);
    }

    delete(url, data, success, error) {
        return this._ajax('DELETE', url, data, 'application/x-www-form-urlencoded', success, error);
    }

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

// 使用示例
$.request = new Request();

/**
 * 翻译工具类
 * 提供多语言翻译功能，支持DOM元素自动翻译和API翻译服务
 * @file TranslateUtils.js
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
 * DOM节点工具类
 * 处理DOM元素的遍历、文本节点包装和翻译元素收集
 */
class NodeUtils {
    /**
     * 构造函数
     * 初始化等待翻译元素列表和属性配置
     */
    constructor() {
        /** @type {Array<Object>} 等待翻译的元素列表 */
        this.waitElements = [];
        /** @type {Object} 需要翻译的属性配置 */
        this.attrs = {
            "img": ["alt"],
            "input": ["placeholder"],
            "textarea": ["placeholder"],
            "a": ["title"],
            "button": ["title"],
            "label": ["title"],

            "option": ["label"],
            "optgroup": ["label"],
            //mdui相关属性
            "mdui": ["label", "placeholder", "headline", "description", "helper", "content"],

        }
        /** @type {Array<string>} 过滤的元素标签名 */
        this.filter = [
            'style', 'script', 'link', 'pre', 'code', 'noscript', 'iframe', 'svg', 'path', 'canvas', 'video', 'audio',
        ]

    }

    /**
     * 遍历元素及其所有子元素
     * @param {HTMLElement} element - 要遍历的元素
     * @param {Function} callback - 回调函数
     */
    traverse(element, callback) {
        if (!element?.nodeType || !callback) return;
        if (this.inFilter(element))return;
        callback(element);
        Array.from(element.children || []).forEach(child => {
            this.traverse(child, callback);
        });
    }

    /**
     * 获取等待翻译的元素
     * @param {HTMLElement} element - 要处理的元素
     * @param {string} to - 目标语言
     * @returns {Array<Object>} 等待翻译的元素列表
     */
    getWaitTranslate(element, to) {
        this.waitElements = [];

        // First pass: wrap text nodes
        this.traverse(element, (element) => {
            if (!this.shouldTranslateElement(element)) return;
            this.wrapTextNodes(element);
        });

        // Second pass: process translations
        this.traverse(element, (element) => {
            if (!this.shouldTranslateElement(element)) return;
            this.processAttributes(element, to);
            this.processTextContent(element, to);
        });

        return this.waitElements;
    }

    /**
     * 检查元素是否在过滤列表中
     * @param {HTMLElement} element - 要检查的元素
     * @returns {boolean} 是否在过滤列表中
     */
    inFilter(element){
        return element.tagName && this.filter.includes(element.tagName.toLowerCase());
    }

    /**
     * 检查元素是否应该翻译
     * @param {HTMLElement} element - 要检查的元素
     * @returns {boolean} 是否应该翻译
     */
    shouldTranslateElement(element) {
        return element.tagName &&  !(element.classList.contains('no-translate') || element.classList.contains('material-symbols-outlined'));
    }

    /**
     * 包装文本节点
     * @param {HTMLElement} element - 要处理的元素
     */
    wrapTextNodes(element) {
        // Skip if element has no children or only has element nodes∂
        if (element.childNodes.length <= 1  || element.children.length === element.childNodes.length) {
            return;
        }

        // Convert to array to avoid live NodeList issues
        const nodes = Array.from(element.childNodes);
        nodes.forEach(node => {
            // Only process direct text nodes that aren't empty
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
                // Skip if parent is already an i tag (prevent infinite recursion)
                if (element.tagName.toLowerCase() === 'span') return;
                const wrapper = document.createElement("span");
                wrapper.classList.add("translate-wrapper");
                node.replaceWith(wrapper);
                wrapper.appendChild(node);
            }
        });
    }

    /**
     * 处理元素属性翻译
     * @param {HTMLElement} element - 要处理的元素
     * @param {string} to - 目标语言
     */
    processAttributes(element, to) {
        const tagName = element.tagName.toLowerCase();
        
        Object.entries(this.attrs).forEach(([key, attrs]) => {
            if (!tagName.startsWith(key)) return;
            
            attrs.forEach(attr => {
                const value = element.getAttribute(attr);
                if (value?.trim()) {
                    this.addTranslateElem(element, `attr_${attr}`, value, to);
                }
            });
        });
    }

    /**
     * 处理文本内容翻译
     * @param {HTMLElement} element - 要处理的元素
     * @param {string} to - 目标语言
     */
    processTextContent(element, to) {
        if (element.children.length === 0 && element.innerText?.trim()) {
            this.addTranslateElem(element, "text", element.innerText, to);
        }
    }

    /**
     * 移除表情符号
     * @param {string} content - 要处理的内容
     * @returns {string} 处理后的内容
     */
    removeEmoji(content){
        return content.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, "");
    }
    
    /**
     * 添加翻译元素
     * @param {HTMLElement} element - 要翻译的元素
     * @param {string} prop - 属性类型
     * @param {string} data - 要翻译的数据
     * @param {string} to - 目标语言
     */
    addTranslateElem(element, prop, data, to) {
        // 过滤表情符号和非文本内容
        const filteredData = this.removeEmoji(data).trim();

        // 如果过滤后的内容为空，直接返回
        if (!filteredData || filteredData.length === 0) return;

        // 如果翻译已完成，直接返回
        if (element.dataset['translate_' + prop + '_finish'] === to) {
            return;
        }

        // 创建元素对象
        const elementObject = {
            element: element,
            prop: prop,
            data: filteredData
        };

        // 如果未存储原始数据，则存储
        if (!element.dataset['translate_' + prop]) {
            element.dataset['translate_' + prop] = filteredData;
        } else {
            // 否则使用已存储的数据
            elementObject.data = element.dataset['translate_' + prop];
        }

        // 将元素对象加入等待队列
        this.waitElements.push(elementObject);
    }
    
    /**
     * 替换等待翻译的元素
     * @param {Array<Object>} elements - 元素列表
     * @param {Array<Object>} translateTexts - 翻译文本列表
     * @param {string} to - 目标语言
     * @returns {Array<Object>} 处理后的元素列表
     */
    replaceWaitTranslate(elements, translateTexts, to) {
        for (const element of elements) {
            if (element.element.dataset['translate_' + element.prop + '_finish'] === to) {
                continue;
            }
            for (const translate of translateTexts) {

                if (translate.Text === element.data) {

                    if (element.prop.startsWith("attr_")) {
                        element.element.setAttribute(element.prop.substring(5), translate.Translate);
                    } else {
                        element.element.innerText = translate.Translate;
                    }
                    element.element.dataset['translate_' + element.prop + '_finish'] = to;
                }
            }
        }
        return elements;
    }
}

/**
 * 翻译工具对象
 * 提供翻译API调用和DOM翻译功能
 */
let TranslateUtils = {
    /** @type {string} 认证API地址 */
    authApi: 'https://edge.microsoft.com/translate/auth',
    /** @type {string} 翻译API地址 */
    translateApi: 'https://api.cognitive.microsofttranslator.com/translate?from={from}&to={to}&api-version=3.0&includeSentenceLength=true',
    /** @type {Array<Object>} 支持的语言列表 */
    languages: [
        {"id": "ukrainian", "name": "УкраїнськаName", "serviceId": "uk"},
        {"id": "norwegian", "name": "Norge", "serviceId": "no"},
        {"id": "welsh", "name": "color name", "serviceId": "cy"},
        {"id": "dutch", "name": "nederlands", "serviceId": "nl"},
        {"id": "japanese", "name": "しろうと", "serviceId": "ja"},
        {"id": "filipino", "name": "Pilipino", "serviceId": "fil"},
        {"id": "english", "name": "English", "serviceId": "en"},
        {"id": "lao", "name": "ກະຣຸນາ", "serviceId": "lo"},
        {"id": "telugu", "name": "తెలుగుQFontDatabase", "serviceId": "te"},
        {"id": "romanian", "name": "Română", "serviceId": "ro"},
        {"id": "nepali", "name": "नेपालीName", "serviceId": "ne"},
        {"id": "french", "name": "Français", "serviceId": "fr"},
        {"id": "haitian_creole", "name": "Kreyòl ayisyen", "serviceId": "ht"},
        {"id": "czech", "name": "český", "serviceId": "cs"},
        {"id": "swedish", "name": "Svenska", "serviceId": "sv"},
        {"id": "russian", "name": "Русский язык", "serviceId": "ru"},
        {"id": "malagasy", "name": "Malagasy", "serviceId": "mg"},
        {"id": "burmese", "name": "ဗာရမ်", "serviceId": "my"},
        {"id": "pashto", "name": "پښتوName", "serviceId": "ps"},
        {"id": "thai", "name": "คนไทย", "serviceId": "th"},
        {"id": "armenian", "name": "Արմենյան", "serviceId": "hy"},
        {"id": "chinese_simplified", "name": "简体中文", "serviceId": "zh-CHS"},
        {"id": "persian", "name": "Persian", "serviceId": "fa"},
        {"id": "chinese_traditional", "name": "繁體中文", "serviceId": "zh-CHT"},
        {"id": "kurdish", "name": "Kurdî", "serviceId": "ku"},
        {"id": "turkish", "name": "Türkçe", "serviceId": "tr"},
        {"id": "hindi", "name": "हिन्दी", "serviceId": "hi"},
        {"id": "bulgarian", "name": "български", "serviceId": "bg"},
        {"id": "malay", "name": "Malay", "serviceId": "ms"},
        {"id": "swahili", "name": "Kiswahili", "serviceId": "sw"},
        {"id": "oriya", "name": "ଓଡିଆ", "serviceId": "or"},
        {"id": "icelandic", "name": "ÍslandName", "serviceId": "is"},
        {"id": "irish", "name": "Íris", "serviceId": "ga"},
        {"id": "khmer", "name": "ខ្មែរKCharselect unicode block name", "serviceId": "km"},
        {"id": "gujarati", "name": "ગુજરાતી", "serviceId": "gu"},
        {"id": "slovak", "name": "Slovenská", "serviceId": "sk"},
        {"id": "kannada", "name": "ಕನ್ನಡ್Name", "serviceId": "kn"},
        {"id": "hebrew", "name": "היברית", "serviceId": "he"},
        {"id": "hungarian", "name": "magyar", "serviceId": "hu"},
        {"id": "marathi", "name": "मराठीName", "serviceId": "mr"},
        {"id": "tamil", "name": "தாமில்", "serviceId": "ta"},
        {"id": "estonian", "name": "eesti keel", "serviceId": "et"},
        {"id": "malayalam", "name": "മലമാലം", "serviceId": "ml"},
        {"id": "inuktitut", "name": "ᐃᓄᒃᑎᑐᑦ", "serviceId": "iu"},
        {"id": "arabic", "name": "بالعربية", "serviceId": "ar"},
        {"id": "deutsch", "name": "Deutsch", "serviceId": "de"},
        {"id": "slovene", "name": "slovenščina", "serviceId": "sl"},
        {"id": "bengali", "name": "বেঙ্গালী", "serviceId": "bn"},
        {"id": "urdu", "name": "اوردو", "serviceId": "ur"},
        {"id": "azerbaijani", "name": "azerbaijani", "serviceId": "az"},
        {"id": "portuguese", "name": "português", "serviceId": "pt"},
        {"id": "samoan", "name": "lifiava", "serviceId": "sm"},
        {"id": "afrikaans", "name": "afrikaans", "serviceId": "af"},
        {"id": "tongan", "name": "汤加语", "serviceId": "to"},
        {"id": "greek", "name": "ελληνικά", "serviceId": "el"},
        {"id": "indonesian", "name": "IndonesiaName", "serviceId": "id"},
        {"id": "spanish", "name": "Español", "serviceId": "es"},
        {"id": "danish", "name": "dansk", "serviceId": "da"},
        {"id": "amharic", "name": "amharic", "serviceId": "am"},
        {"id": "punjabi", "name": "ਪੰਜਾਬੀName", "serviceId": "pa"},
        {"id": "albanian", "name": "albanian", "serviceId": "sq"},
        {"id": "lithuanian", "name": "Lietuva", "serviceId": "lt"},
        {"id": "italian", "name": "italiano", "serviceId": "it"},
        {"id": "vietnamese", "name": "Tiếng Việt", "serviceId": "vi"},
        {"id": "korean", "name": "한국어", "serviceId": "ko"},
        {"id": "maltese", "name": "Malti", "serviceId": "mt"},
        {"id": "finnish", "name": "suomi", "serviceId": "fi"},
        {"id": "catalan", "name": "català", "serviceId": "ca"},
        {"id": "croatian", "name": "hrvatski", "serviceId": "hr"},
        {"id": "bosnian", "name": "bosnian", "serviceId": "bs-Latn"},
        {"id": "polish", "name": "Polski", "serviceId": "pl"},
        {"id": "latvian", "name": "latviešu", "serviceId": "lv"},
        {"id": "maori", "name": "Maori", "serviceId": "mi"}
    ],
    findLanguageServerId: function (id) {
        for (let language of this.languages) {
            if (language.id === id) {
                return language.serviceId;
            }
        }
        return null;
    },
    jwt: null,
    lastTime: 0,
    /**

     {
     "element":element,
     "from":from,
     "to":to,
     "callback
     }

     **/
    fromLanguage: "chinese_simplified",
    toLanguage: "chinese_simplified",
    init(localLanguage, autoLanguage) {
        autoLanguage = autoLanguage || false;
        this.fromLanguage = localLanguage || "chinese_simplified";
        let toLanguage = localStorage.getItem("language");
        if (autoLanguage && !toLanguage) {
            toLanguage = this.autoLanguage();
        } else {
            toLanguage = toLanguage || "chinese_simplified";
        }
        this.change(toLanguage);
        this.bindEvent();
    },
    bindEvent() {
        //监听页面新增元素进行翻译
        let that = this;

        // 配置观察选项
        const config = {childList: true};

        // 回调函数，当观察到变动时执行
        const callback = function (mutationsList, observer) {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        that.autoTranslate(node);
                    });
                }
            }
        };

        // 创建一个观察器实例并传入回调函数
        const observer = new MutationObserver(callback);

        // 以上述配置开始观察目标节点
        observer.observe(document.body, config);
    },
    autoLanguage() {
        const languageMap = {
            "uk": "ukrainian",
            "no": "norwegian",
            "cy": "welsh",
            "nl": "dutch",
            "ja": "japanese",
            "fil": "filipino",
            "en": "english",
            "lo": "lao",
            "te": "telugu",
            "ro": "romanian",
            "ne": "nepali",
            "fr": "french",
            "ht": "haitian_creole",
            "cs": "czech",
            "sv": "swedish",
            "ru": "russian",
            "mg": "malagasy",
            "my": "burmese",
            "ps": "pashto",
            "th": "thai",
            "hy": "armenian",
            "zh-CHS": "chinese_simplified",
            "fa": "persian",
            "zh-CHT": "chinese_traditional",
            "ku": "kurdish",
            "tr": "turkish",
            "hi": "hindi",
            "bg": "bulgarian",
            "ms": "malay",
            "sw": "swahili",
            "or": "oriya",
            "is": "icelandic",
            "ga": "irish",
            "km": "khmer",
            "gu": "gujarati",
            "sk": "slovak",
            "kn": "kannada",
            "he": "hebrew",
            "hu": "hungarian",
            "mr": "marathi",
            "ta": "tamil",
            "et": "estonian",
            "ml": "malayalam",
            "iu": "inuktitut",
            "ar": "arabic",
            "de": "deutsch",
            "sl": "slovene",
            "bn": "bengali",
            "ur": "urdu",
            "az": "azerbaijani",
            "pt": "portuguese",
            "sm": "samoan",
            "af": "afrikaans",
            "to": "tongan",
            "el": "greek",
            "id": "indonesian",
            "es": "spanish",
            "da": "danish",
            "am": "amharic",
            "pa": "punjabi",
            "sq": "albanian",
            "lt": "lithuanian",
            "it": "italian",
            "vi": "vietnamese",
            "ko": "korean",
            "mt": "maltese",
            "fi": "finnish",
            "ca": "catalan",
            "hr": "croatian",
            "bs-Latn": "bosnian",
            "pl": "polish",
            "lv": "latvian",
            "mi": "maori"
        };

// 获取浏览器语言
        const browserLanguage = navigator.language || navigator.userLanguage;

// 特别处理简体中文和繁体中文
        let languageId;
        if (browserLanguage.toLowerCase() === "zh-cn" || browserLanguage.toLowerCase() === "zh-sg" || browserLanguage.toLowerCase() === "zh") {
            languageId = "chinese_simplified";
        } else if (browserLanguage.toLowerCase() === "zh-tw" || browserLanguage.toLowerCase() === "zh-hk") {
            languageId = "chinese_traditional";
        } else {
            // 提取语言代码
            const languageCode = browserLanguage.split('-')[0].toLowerCase();
            languageId = languageMap[languageCode] || "chinese_simplified"; // chinese_simplified
        }
        return languageId;

    },
    change(toLanguage) {
        this.toLanguage = toLanguage;
        localStorage.setItem("language", toLanguage);
        this.autoTranslate(document);
    },
    autoTranslate: function (element) {
        element = element || document;
        let nodeUtils = new NodeUtils();
        let waitElements = nodeUtils.getWaitTranslate(element, this.toLanguage);
        if (this.fromLanguage === this.toLanguage) {
            let translatedTextResult = [];
            for (let i = 0; i < waitElements.length; i++) {
                translatedTextResult.push({
                    "Text": waitElements[i].data,
                    "Translate": waitElements[i].element.dataset['translate_' + waitElements[i].prop]
                })
            }
            nodeUtils.replaceWaitTranslate(waitElements, translatedTextResult, this.toLanguage);
            return;
        }
        for (const translateText of this.splitTranslateArray(waitElements)) {

            let translatedTextResult = [];

            this.translate(this.fromLanguage, this.toLanguage, translateText, (translateData) => {
                for (let i = 0; i < translateData.length; i++) {
                    translatedTextResult.push({
                        "Text": translateText[i].Text,
                        "Translate": translateData[i].translations[0].text
                    })
                }
                nodeUtils.replaceWaitTranslate(waitElements, translatedTextResult, this.toLanguage);
                // console.log("剩余翻译",waitElements);
            });
        }


    },
    translateText: function (text, callback) {
        if (text.length === 0) {
            return;
        }

        let translate = [];

        if (Array.isArray(text)) {
            text.forEach((item) => {
                translate.push({
                    Text: item
                })
            });
        } else {
            translate.push({
                Text: text
            })
        }

        if (this.fromLanguage === this.toLanguage) {
            callback(text);
            return;
        }

        TranslateUtils.translate(TranslateUtils.fromLanguage, TranslateUtils.toLanguage, translate, (data) => {
            let result = [];
            data.forEach((item) => {
                result.push(item.translations[0].text);
            });

            if (Array.isArray(text)) {
                callback(result);
            } else {
                callback(result[0]);
            }
        });
    },
    translate: function (from, to, translateArray, callback, retryCount = 0) {
        const maxRetries = 3;
        
        this.getAuthToken((token) => {
            let headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
            let uri = this.translateApi.replace('{from}', this.findLanguageServerId(from)).replace('{to}', this.findLanguageServerId(to));

            //使用fetch
            fetch(uri, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(translateArray)
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            }).then((data) => {
                callback(data);
            }).catch((error) => {
                console.error(`Error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
                
                // Retry logic
                if (retryCount < maxRetries) {
                    console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
                    // Exponential backoff: wait longer between each retry
                    const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 8000);
                    
                    setTimeout(() => {
                        this.translate(from, to, translateArray, callback, retryCount + 1);
                    }, backoffTime);
                } else {
                    console.error('Max retries reached. Translation failed.');
                }
            });
        });
    },
    getAuthToken: function (callback) {
        //判断jwt是否过期，jwt 8分钟过期
        if (this.jwt && new Date().getTime() - this.lastTime < 480000) {
            callback(this.jwt);
            return;
        }
        fetch(this.authApi, {
            method: "GET",
        }).then((response) => {
            return response.text();
        }).then((data) => {
            this.jwt = data;
            this.lastTime = new Date().getTime();
            callback(data);
        }).catch((error) => {
            console.error('Error:', error);
        });
    },

    splitTranslateArray: function (elements, totalLength = 48000) {
        let result = [];
        let temp = [];
        let arrayLength = 0;
        for (let i = 0; i < elements.length; i++) {

            let data = elements[i].data;
            let length = data.length;

            if (arrayLength + length > totalLength) {
                result.push(temp);
                temp = [];
                arrayLength = 0;
            } else {
                arrayLength+=length;
                temp.push({
                    Text: data
                })
            }

        }
        if (temp.length > 0) {
            result.push(temp);
        }
        return result;
    }
}


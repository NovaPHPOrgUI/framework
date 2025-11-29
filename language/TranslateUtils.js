/**
 * 翻译工具类
 * 提供多语言翻译功能，支持DOM元素自动翻译和API翻译服务
 * @file TranslateUtils.js
 * @author License Auto System
 * @version 1.0.0
 * @requires NodeUtils.js - DOM节点工具类
 */

/*
 * Copyright (c) 2025. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

/**
 * 翻译工具对象
 * 提供翻译API调用和DOM翻译功能
 */
let TranslateUtils = {
    /** @type {string} 认证API地址 */
    authApi: 'https://edge.microsoft.com/translate/auth',
    /** @type {string} 翻译API地址 */
    translateApi: 'https://api.cognitive.microsofttranslator.com/translate?from={from}&to={to}&api-version=3.0&includeSentenceLength=true',
    
    /** @type {Map} 语言ID到ServiceID的映射缓存 */
    _languageIdMap: null,
    /** @type {Map} ServiceID到语言ID的映射缓存 */
    _languageServiceIdMap: null,
    /** @type {NodeUtils} NodeUtils单例实例 */
    _nodeUtils: null,
    
    /** @type {Object} 浏览器语言到内部语言ID的映射 */
    _browserLanguageMap: {
        // 完整 locale 映射
        "zh-cn": "chinese_simplified",
        "zh-sg": "chinese_simplified",
        "zh": "chinese_simplified",
        "zh-tw": "chinese_traditional",
        "zh-hk": "chinese_traditional",
        // 语言代码映射
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
        "fa": "persian",
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
        "pl": "polish",
        "lv": "latvian",
        "mi": "maori"
    },
    
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
    
    /**
     * 初始化语言映射表（懒加载，只执行一次）
     * 将 O(N) 线性查找优化为 O(1) 哈希查找
     */
    _initLanguageMaps() {
        if (this._languageIdMap) return; // 已初始化
        
        this._languageIdMap = new Map();
        this._languageServiceIdMap = new Map();
        
        for (const lang of this.languages) {
            this._languageIdMap.set(lang.id, lang.serviceId);
            this._languageServiceIdMap.set(lang.serviceId, lang.id);
        }
    },
    
    /**
     * 根据语言ID查找ServiceID
     * @param {string} id - 语言ID
     * @returns {string|null} ServiceID
     */
    findLanguageServerId: function (id) {
        this._initLanguageMaps();
        return this._languageIdMap.get(id) || null;
    },
    
    /**
     * 获取 NodeUtils 单例实例
     * @returns {NodeUtils} NodeUtils实例
     */
    _getNodeUtils() {
        if (!this._nodeUtils) {
            this._nodeUtils = new NodeUtils();
        }
        return this._nodeUtils;
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
        let toLanguage = localStorage.getItem("language") || "";
        
        // 清理无效值
        toLanguage = toLanguage.trim();
        
        if (autoLanguage && !toLanguage) {
            toLanguage = this.autoLanguage();
        } else {
            toLanguage = toLanguage || "chinese_simplified";
        }

        console.log(this.fromLanguage, toLanguage);

        this.change(toLanguage);
        this.bindEvent();
    },
    bindEvent() {
        //监听页面新增元素进行翻译
        let that = this;
        let rafScheduled = false;
        let pendingNodes = new Set();

        const config = {
            childList: true,      // 子节点增删
            characterData: true,  // 文本内容变化
            subtree: true
        };

        const executeTranslate = function() {
            pendingNodes.forEach(node => {
                that.autoTranslate(node);
            });
            pendingNodes.clear();
            rafScheduled = false;
        };

        const callback = function (mutationsList) {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            pendingNodes.add(node);
                        }
                    });
                } else if (mutation.type === 'characterData') {
                    const parent = mutation.target.parentElement;
                    if (parent) {
                        pendingNodes.add(parent);
                    }
                }
            }

            if (!rafScheduled && pendingNodes.size > 0) {
                rafScheduled = true;
                requestAnimationFrame(executeTranslate);
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(document.body, config);
    },
    /**
     * 自动检测浏览器语言
     * 使用预计算的映射表，避免重复对象创建和字符串操作
     * @returns {string} 语言ID
     */
    autoLanguage() {
        // 获取浏览器语言并转为小写（只调用一次）
        const browserLang = (navigator.language || navigator.userLanguage).toLowerCase();
        
        // 优先匹配完整 locale（如 zh-cn, zh-tw）
        if (this._browserLanguageMap[browserLang]) {
            return this._browserLanguageMap[browserLang];
        }
        
        // 降级：提取语言代码（如 zh-cn -> zh）
        const langCode = browserLang.split('-')[0];
        return this._browserLanguageMap[langCode] || "chinese_simplified";
    },
    change(toLanguage) {
        if (!toLanguage) {
            console.error('TranslateUtils.change: Invalid toLanguage:', toLanguage);
            return;
        }
        this.toLanguage = toLanguage;
        localStorage.setItem("language", toLanguage);
        this.autoTranslate(document.body);
    },
    /**
     * 自动翻译DOM元素
     * 使用单例 NodeUtils 避免重复实例化
     * @param {HTMLElement} element - 要翻译的元素
     */
    autoTranslate: function (element) {
        element = element || document.body;
        const nodeUtils = this._getNodeUtils();
        const waitElements = nodeUtils.getWaitTranslate(element, this.toLanguage);
        if (waitElements.length === 0) {
            return;
        }

        // 如果源语言和目标语言相同，直接恢复原始文本
        if (this.fromLanguage === this.toLanguage) {

            const translatedTextResult = waitElements.map((waitElement, index) => ({
                index: index,
                "Text": waitElement.serialized,
                "Translate": waitElement.serialized
            }));

            nodeUtils.replaceWaitTranslate(waitElements, translatedTextResult, this.toLanguage);
            return;
        }



        // 分块翻译，避免单次请求过大
        for (const chunk of this.splitTranslateArray(waitElements)) {
            if (!chunk || chunk.payload.length === 0) {
                continue;
            }
            this.translate(this.fromLanguage, this.toLanguage, chunk.payload, (translateData) => {
                const translatedTextResult = [];
                for (let i = 0; i < translateData.length; i++) {
                    translatedTextResult.push({
                        index: chunk.indexes[i],
                        "Text": chunk.payload[i].Text,
                        "Translate": translateData[i].translations[0].text
                    });
                }
                nodeUtils.replaceWaitTranslate(waitElements, translatedTextResult, this.toLanguage);
            });
        }
    },
    /**
     * 翻译文本（支持单个字符串或字符串数组）
     * @param {string|Array<string>} text - 要翻译的文本
     * @param {Function} callback - 回调函数
     */
    translateText: function (text, callback) {
        if (!text || (Array.isArray(text) && text.length === 0)) {
            callback(Array.isArray(text) ? [] : '');
            return;
        }

        // 如果源语言和目标语言相同，直接返回原文
        if (this.fromLanguage === this.toLanguage) {
            callback(text);
            return;
        }

        // 统一转为数组格式处理
        const isArray = Array.isArray(text);
        const textArray = isArray ? text : [text];
        const translate = textArray.map(item => ({ Text: item }));

        this.translate(this.fromLanguage, this.toLanguage, translate, (data) => {
            const result = data.map(item => item.translations[0].text);
            callback(isArray ? result : result[0]);
        });
    },
    /**
     * 调用翻译API
     * 支持自动重试和指数退避策略
     * @param {string} from - 源语言ID
     * @param {string} to - 目标语言ID
     * @param {Array<Object>} translateArray - 要翻译的文本数组
     * @param {Function} callback - 翻译成功回调
     * @param {number} retryCount - 当前重试次数
     */
    translate: function (from, to, translateArray, callback, retryCount = 0) {
        const maxRetries = 3;
        
        this.getAuthToken((token) => {
            const fromServiceId = this.findLanguageServerId(from);
            const toServiceId = this.findLanguageServerId(to);
            const uri = this.translateApi
                .replace('{from}', fromServiceId)
                .replace('{to}', toServiceId);

            fetch(uri, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(translateArray)
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            }).then((data) => {
                callback(data);
            }).catch((error) => {
                console.error(`Translation error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
                
                // 指数退避重试策略
                if (retryCount < maxRetries) {
                    const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 8000);
                    console.log(`Retrying in ${backoffTime}ms... (${retryCount + 1}/${maxRetries})`);
                    
                    setTimeout(() => {
                        this.translate(from, to, translateArray, callback, retryCount + 1);
                    }, backoffTime);
                } else {
                    console.error('Max retries reached. Translation failed permanently.');
                }
            });
        });
    },
    /**
     * 获取认证Token
     * Token缓存8分钟，避免频繁请求
     * @param {Function} callback - Token获取成功回调
     */
    getAuthToken: function (callback) {
        const TOKEN_EXPIRE_TIME = 480000; // 8分钟（毫秒）
        const now = new Date().getTime();
        
        // 如果token存在且未过期，直接使用缓存
        if (this.jwt && now - this.lastTime < TOKEN_EXPIRE_TIME) {
            callback(this.jwt);
            return;
        }
        
        // 请求新token
        fetch(this.authApi, {
            method: "GET",
        }).then((response) => {
            return response.text();
        }).then((data) => {
            this.jwt = data;
            this.lastTime = now;
            callback(data);
        }).catch((error) => {
            console.error('Auth token fetch error:', error);
        });
    },

    /**
     * 分割翻译数组
     * 将大文本分割成多个小块，避免单次请求过大
     * @param {Array<Object>} elements - 待翻译元素数组
     * @param {number} totalLength - 单个分块的最大字符数
     * @returns {Array<Object>} 分块后的数组
     */
    splitTranslateArray: function (elements, totalLength = 48000) {
        if (!Array.isArray(elements) || elements.length === 0) {
            return [];
        }

        const result = [];
        let payload = [];
        let indexes = [];
        let currentLength = 0;

        // 将当前批次推入结果
        const flush = () => {
            if (payload.length > 0) {
                result.push({
                    payload: payload,
                    indexes: indexes
                });
                payload = [];
                indexes = [];
                currentLength = 0;
            }
        };

        elements.forEach((element, index) => {

            const data = element?.serialized || '';
            const length = data.length;

            if (!length) return; // 跳过空元素

            // 如果单个元素超过限制，单独处理
            if (length > totalLength) {
                flush();
                result.push({
                    payload: [{ Text: data }],
                    indexes: [index]
                });
                return;
            }

            // 如果加入当前元素会超过限制，先刷新当前批次
            if (currentLength + length > totalLength) {
                flush();
            }

            // 将元素加入当前批次
            payload.push({ Text: data });
            indexes.push(index);
            currentLength += length;
        });

        // 处理最后一个批次
        flush();
        return result;
    }
}



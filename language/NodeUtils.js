/**
 * 浏览器级翻译 NodeUtils
 * 核心思想：零假设 + 实用主义
 * 
 * 设计哲学：
 *   不硬编码标签列表，不依赖语义化HTML，不假设开发者会遵循任何规范。
 *   只看实际内容，通过运行时判断来决定行为。
 * 
 * 识别规则：
 *   如果元素的第一个或最后一个子节点是文本节点 → 包含直接文本 → 应该翻译
 *   
 *   示例：
 *     <div>文本 <a>链接</a></div>        ✅ 第一个子节点是文本 → 翻译
 *     <div><a>链接</a> 文本</div>        ✅ 最后一个子节点是文本 → 翻译
 *     <div><a>链接1</a><a>链接2</a></div> ❌ 没有直接文本 → 跳过（递归进入）
 * 
 * 序列化规则：
 *   容器内的所有子元素都转换为占位符，不区分 inline/block，保持完整结构
 * 
 * 工作流程：
 *   1. 识别包含直接文本的元素作为翻译单元
 *   2. 序列化：所有子元素 → 占位符（<b0>, <b1>, <b2>...）
 *   3. 翻译：发送序列化后的纯文本
 *   4. 反序列化：占位符 → 还原HTML结构
 * 
 * 示例：
 *   原始: <p>文本1 <a href="#">链接</a> 文本2</p>
 *   序列化: "文本1 <b0>链接</b0> 文本2"
 *   翻译后: "Text1 <b0>Link</b0> Text2"
 *   还原: <p>Text1 <a href="#">Link</a> Text2</p>
 * 
 * 为什么这样设计？
 *   "Bad programmers worry about the code. Good programmers worry about data structures."
 *   不要试图理解开发者的意图，只看数据本身。有直接文本 = 需要翻译，就这么简单。
 */

class NodeUtils {

    constructor() {
        // 需要完全跳过的标签（不翻译也不递归）
        this.ignoredTags = new Set([
            'style', 'script', 'link', 'pre', 'code', 'noscript',
            'iframe', 'svg', 'path', 'canvas', 'video', 'audio', 'font'
        ]);

        this.ignoredClass = new Set([
            "material-symbols-outlined","no-translate"
        ])

        // 属性翻译映射（保留原有逻辑）
        this.attrMap = {
            IMG: ['alt'],
            INPUT: ['placeholder'],
            TEXTAREA: ['placeholder'],
            A: ['title'],
            BUTTON: ['title'],
            LABEL: ['title'],
            OPTION: ['label'],
            OPTGROUP: ['label']
        };

        this.mduiAttrs = ['label', 'placeholder', 'headline', 'description', 'helper', 'content'];
    }

    /**
     * 判断标签是否是自闭合标签
     * 让浏览器自己告诉我们答案，而不是维护硬编码列表
     */
    _isVoidElement(tagName) {
        const temp = document.createElement(tagName);
        // 自闭合标签的 outerHTML 不包含闭合标签
        // 例如：<br> vs <div></div>
        return temp.outerHTML.indexOf('</') === -1;
    }

    /**
     * 获取待翻译内容（新架构）
     * @param {Element} root - 根节点
     * @param {string} to - 目标语言
     * @returns {Array} 翻译任务列表
     */
    getWaitTranslate(root, to) {
        if (!root) return [];

        const waitList = [];

        // --- Step 1：收集并序列化块级容器 ---
        const containers = this._collectTranslateContainers(root, to);

        for (const container of containers) {

            const unit = this._serializeContainer(container);

            // 跳过空内容或纯占位符内容
            if (!unit.serialized || !this._hasActualText(unit.serialized)) {
                continue;
            }
            waitList.push(unit);
        }
        return waitList;
    }

    /**
     * 检查文本是否包含实际内容（不只是空白或占位符）
     */
    _hasActualText(text) {
        // 移除所有占位符
        const withoutTags = text.replace(/<\/?b\d+>/g, '');
        // 检查是否包含有效的可翻译文本（排除纯数字、emoji等）
        return this._hasValidText(withoutTags);
    }

    /*------------------------------------------
     *        块级容器收集（核心）
     ------------------------------------------*/

    /**
     * 收集所有需要翻译的容器
     * 通用策略：如果元素的第一个或最后一个子节点是文本节点 → 包含直接文本 → 应该翻译
     * 关键：一旦找到需要翻译的元素，不再遍历其子元素（避免父子冲突）
     */
    _collectTranslateContainers(root, to) {
        const containers = [];

        // 递归收集
        const collect = (element) => {


            // 基础检查
            if (!element || element.nodeType !== Node.ELEMENT_NODE ) {
                return;
            }

            const tagName = element.tagName.toLowerCase();

            // 跳过忽略的标签
            if (this.ignoredTags.has(tagName)) {
                return;
            }

            // 跳过 no-translate
            if (element.classList){
                for (const classListElement of element.classList) {
                    if (this.ignoredClass.has(classListElement)){
                        return;
                    }
                }
            }


            // 跳过已翻译的（检查自身）
            if (element.dataset.translate_textnode_finish === to) {
                console.log(element,"跳过已翻译的")
                return;
            }

            // 检查是否应该翻译这个元素
            if (this._hasDirectTextContent(element) && this._shouldTranslateContainer(element)) {
                containers.push({
                    "type":"container",
                    "element":element
                });
                return;
            }

            let [attr,value] = this._shouldTranslateAttr(element);
            if (attr.length > 0) {
                containers.push({
                    "type":"attr",
                    "element":element,
                    "attr":attr,
                    "value": value
                });
                return;
            }

            if (element.children.length > 0){
                // 否则，递归处理子元素
                for (const child of element.children) {
                    collect(child);
                }
            }


        };

        collect(root);
        return containers;
    }


    /**
     * 检查元素是否包含直接文本内容
     * 策略：如果第一个或最后一个子节点是文本节点（且非空），则认为包含直接文本
     */
    _hasDirectTextContent(element) {
        if (!element.childNodes || element.childNodes.length === 0) {
            return false;
        }

        const firstChild = element.childNodes[0];
        const lastChild = element.childNodes[element.childNodes.length - 1];

        // 检查第一个子节点
        if (firstChild.nodeType === Node.TEXT_NODE) {
            const text = firstChild.nodeValue.trim();
            if (text.length > 0) {
                return true;
            }
        }

        // 检查最后一个子节点（如果和第一个不同）
        if (lastChild !== firstChild && lastChild.nodeType === Node.TEXT_NODE) {
            const text = lastChild.nodeValue.trim();
            if (text.length > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查文本是否包含有效的可翻译内容
     * 策略：包含任何 Unicode 字母即为有效
     *
     * @param {string} text - 待检查的文本
     * @returns {boolean} true=包含字母, false=纯数字/emoji/符号
     */
    _hasValidText(text) {
        if (!text || typeof text !== 'string') return false;

        // 白名单策略：只要包含任何语言的字母就是有效文本
        // \p{L} 匹配任何 Unicode 字母（中文、英文、日文、阿拉伯文...）
        return /\p{L}/u.test(text);
    }

    /**
     * 检查元素是否需要翻译属性
     * @returns {Array} [属性名, 属性值] 或 ['', '']
     */
    _shouldTranslateAttr(element){
        const tag = element.tagName;

        // 处理普通元素属性
        const attrs = this.attrMap[tag];
        if (attrs) {
            for (const attr of attrs) {
                const val = element.getAttribute(attr);
                if (val && this._hasValidText(val)) {
                    return [attr, val];
                }
            }
        }

        // 处理 MDUI 组件属性
        if (tag.startsWith("MDUI-")) {
            for (const attr of this.mduiAttrs) {
                const val = element.getAttribute(attr);
                if (val && this._hasValidText(val)) {
                    return [attr, val];
                }
            }
        }

        return ['', ''];
    }
    /**
     * 判断容器是否需要翻译
     */
    _shouldTranslateContainer(container) {
        // 可见性检查
        try {
            const style = window.getComputedStyle(container);
            if (style.display === 'none' || style.visibility === 'hidden') {
                return false;
            }
        } catch (e) {
            return false;
        }

        // 检查是否有文本内容
        const text = container.textContent.trim();
        return text.length > 0 && this._hasValidText(text);
    }

    /*------------------------------------------
     *       序列化（核心算法）
     ------------------------------------------*/

    /**
     * 序列化容器：将内联元素转换为占位符
     */
    _serializeContainer(container) {
        // 尝试从缓存恢复
        const cachedSerialized = container.element.dataset['serialized'];
        const cachedTagMap = container.element.dataset['tagMap'];
        
        if (cachedSerialized && cachedTagMap) {
            try {
                return {
                    type: container.type,
                    element: container.element,
                    attr: container.attr || "",
                    serialized: decodeURIComponent(cachedSerialized),
                    tagMap: JSON.parse(decodeURIComponent(cachedTagMap)),
                };
            } catch (e) {
                console.warn('[NodeUtils] Failed to restore from cache, re-serializing:', e);
            }
        }

        // 缓存不存在或无效，重新序列化
        const tagMap = {};
        let tagIndex = 10;
        /**
         * 递归序列化节点
         */
        const serialize = (node) => {
            // 文本节点：直接返回内容
            if (node.nodeType === Node.TEXT_NODE) {
                return node.nodeValue || '';
            }

            // 元素节点：全部转换为占位符
            if (node.nodeType === Node.ELEMENT_NODE) {

                const tagName = node.tagName.toLowerCase();
                const isVoid = this._isVoidElement(tagName);

                const placeholder = `b${tagIndex}`;
                tagIndex++;
                // 递归处理子节点
                let innerText = '';
                for (const child of node.childNodes) {
                    innerText += serialize(child);
                }

                // 保存映射信息（不包含element引用，以便缓存）
                tagMap[placeholder] = {
                    tag: tagName,
                    attrs: this._getAttributes(node),
                    isVoid: isVoid
                };

                // 返回占位符格式
                // 自闭合标签：<b0>（无闭合标签）
                // 普通标签：<b0>内容</b0>
                if (isVoid) {
                    return `<${placeholder}>`;
                } else {
                    return `<${placeholder}>${innerText}</${placeholder}>`;
                }
            }

            return '';
        };
        
        let serialized = '';
        if (container.type === "container") {
            // 最外层：只处理子节点，不转换容器本身
            for (const child of container.element.childNodes) {
                serialized += serialize(child);
            }
            serialized = serialized.trim();
        } else {
            serialized = container.value;
        }

        // 缓存序列化结果和tagMap
        container.element.dataset['serialized'] = encodeURIComponent(serialized);
        container.element.dataset['tagMap'] = encodeURIComponent(JSON.stringify(tagMap));

        return {
            type: container.type,
            element: container.element,
            attr: container.attr || "",
            serialized,
            tagMap,
        };
    }

    /**
     * 获取元素的所有属性
     */
    _getAttributes(element) {
        const attrs = {};
        for (const attr of element.attributes) {
            attrs[attr.name] = attr.value;
        }
        return attrs;
    }


    /*------------------------------------------
     *       反序列化（还原HTML）
     ------------------------------------------*/

    /**
     * 反序列化：将占位符还原为HTML标签
     */
    _deserializeContainer(unit, translatedText) {

        const { tagMap } = unit;
        let result = translatedText;

        // 如果 tagMap 为空，直接返回
        if (Object.keys(tagMap).length === 0) {
            return result;
        }

        // 获取所有占位符索引，倒序处理（防止 b10 被 b1 误替换）
        const indices = Object.keys(tagMap)
            .map(k => {
                // tagMap 的 key 是 'b0', 'b1' 这样的字符串
                if (typeof k === 'string' && k.startsWith('b')) {
                    return parseInt(k.substring(1));
                }
                return -1;
            })
            .filter(idx => idx >= 0)
            .sort((a, b) => b - a);

        for (const idx of indices) {
            const placeholder = `b${idx}`;
            const tagInfo = tagMap[placeholder];

            if (!tagInfo) {
                console.warn(`[NodeUtils] tagInfo not found for placeholder: ${placeholder}`);
                continue;
            }

            // 构建标签
            const attrStr = Object.entries(tagInfo.attrs || {})
                .map(([k, v]) => `${k}="${this._escapeHtml(v)}"`)
                .join(' ');
            
            const openTag = attrStr ? `<${tagInfo.tag} ${attrStr}>` : `<${tagInfo.tag}>`;

            const beforeReplace = result;

            // 自闭合标签：只替换 <b0>，无闭合标签
            if (tagInfo.isVoid) {
                const regex = new RegExp(`<${placeholder}>`, 'g');
                result = result.replace(regex, openTag);
            } else {
                // 普通标签：替换 <b0>内容</b0>
                const closeTag = `</${tagInfo.tag}>`;
                const regex = new RegExp(`<${placeholder}>(.*?)</${placeholder}>`, 'gs');
                result = result.replace(regex, (match, inner) => {
                    return openTag + inner + closeTag;
                });
            }

            // 检查是否替换成功
            if (beforeReplace === result) {
                console.warn(`[NodeUtils] Failed to replace placeholder <${placeholder}> in text:`, result.substring(0, 100));
            }
        }

        return result;
    }

    /**
     * HTML转义（防止XSS）
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /*------------------------------------------
     *         替换逻辑（新架构）
     ------------------------------------------*/

    /**
     * 替换翻译结果
     */
    replaceWaitTranslate(elements, translated, to) {

        if (!to){
            return
        }

        for (let i = 0; i < translated.length; i++) {
            const item = translated[i];
            
            let target = null;

            // 通过索引或文本匹配找到目标
            if (typeof item.index === "number") {
                target = elements[item.index];
            }

            if (!target) {
                console.warn('[NodeUtils] Target not found for item:', item);
                continue;
            }


            const finishKey = `translate_finish`;

            // 跳过已翻译的
            if (target.element.dataset[finishKey] === to) {
                continue;
            }

            // 先标记完成（在修改 DOM 之前，避免触发 MutationObserver 再次翻译）
            target.element.dataset[finishKey] = to;

            if (target.type === "container"){
                target.element.innerHTML = this._deserializeContainer(target, item.Translate);
            }else{
                target.element.setAttribute(target.attr,item.Translate)
            }
        }
    }
}

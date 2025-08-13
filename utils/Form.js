/**
 * 表单工具类
 * 提供表单数据获取、设置、验证和提交功能，支持多种MDUI组件
 * @file Form.js
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

/** @type {string} 表单元素选择器字符串 */
let formElems = "mdui-text-field,mdui-switch,mdui-checkbox,mdui-radio-group,mdui-select,mdui-slider,mdui-file-upload,mdui-area-picker,mdui-range-slider,mdui-chip-group,mdui-date-picker"

/**
 * 表单工具对象
 * 提供表单操作的各种功能方法
 * @namespace $.form
 */
$.form = {

    /**
     * 获取表单数据
     * @param {String} form - 表单元素
     * @returns {Object} 表单数据对象
     */
    get: function (form) {
        let data = $(form).serializeObject();

        //file upload
        $(form).find("mdui-file-upload").each(function (key, item) {
            let name = $(item).attr("name");
            data[name] = $(item).val();
        });

        $(form).find("mdui-switch").each(function (key, item) {
            let name = $(item).attr("name");
            data[name] = $(item).prop("checked")?1:0;
        });

        $(form).find("mdui-chip-group").each(function (key, item) {
            let name = $(item).attr("name");
            data[name] = $(item).val();
        });

        $(form).find("mdui-area-picker").each(function (key, item) {
            let name = $(item).attr("name");
            data[name] = $(item).val();
        });

        $(form).find("mdui-date-picker").each(function (key, item) {
            let name = $(item).attr("name");
            data[name] = $(item).val();
        });
        return data;
    },
    
    /**
     * 设置表单数据
     * @param {String} form - 表单元素
     * @param {Object} data - 要设置的数据对象
     * @param {boolean} [disabled] - 是否禁用表单元素
     */
    set: function (form, data, disabled) {
        $(form).find(formElems).each(function () {
            let name = $(this).attr("name");
            let value = data[name];

            if(value === undefined) return;

            if ($(this).is("mdui-checkbox")) {
                if (value instanceof Array) {
                    if (value.indexOf($(this).val()) !== -1) {
                        $(this).prop("checked", true);
                    }
                }else{
                    $(this).prop("checked", value === 1 || value === "true" || value === true || value === "1" );
                }

            } else if ($(this).is("mdui-switch")) {
                $(this).prop("checked", value === 1 || value === "true" || value === true || value === "1" );
            } else if ($(this).is("mdui-area-picker")) {
                $(this)[0].value = value;
            } else if ($(this).is("mdui-range-slider")) {
                $(this)[0].value = value;
                // 触发change事件
                $(this).trigger('change');
            } else if($(this).is("mdui-chip-group")){
                $(this)[0].value = value
            } else if ($(this).is("mdui-file-upload")) {
                $(this)[0].value = value
            } else if ($(this).is("mdui-select")) {
                if (typeof value !== "object") {
                    value = value.toString();
                }
                $(this)[0].value = value
            } else {
                if(typeof value === "object"){
                    value = JSON.stringify(value);
                }
                $(this).val(value);
            }
            // 如果disabled为true，则禁用元素
            if (disabled ) { // 不禁用mdui-range-slider
                if (
                    value !==null &&
                    value.length > 0
                    ){
                    $(this).prop('disabled', true);
                }

            }
        });
    },
    
    /**
     * 验证表单
     * @param {String} form - 表单元素
     * @returns {boolean} 验证是否通过
     */
    validate: function (form) {
        let result = true;
        $(form).find(formElems).each(function (){
            let elem = $(this)[0];
            if (typeof elem.validate === "function") {
                elem.validate();
            }

            if(elem.validity.valid === false){
                elem.reportValidity();
                result = false;
                return false;
            }
        });
        return result;
    },

    /**
     * 提交表单
     * @param {String|HTMLElement|jQuery} form - 表单元素
     * @param {Object} [options] - 选项对象
     *   - options.callback(data): 提交时回调（必选，若不提供将触发原生提交）
     *   - options.beforeSubmit(data): 提交前回调，返回 false 可中断
     *   - options.afterSubmit(result): 提交后回调；若 callback 返回 Promise，将在 resolve 后触发
     */
    submit: function (form, options) {
        if (typeof form === "object") {
            form = form[0];
        }

        options = (typeof options === 'object' && options !== null) ? options : {};
        const callback = (typeof options.callback === 'function') ? options.callback : undefined;

        if (!callback) {
            $(form).trigger('submit');
            return;
        }

        $(form).on("submit", function (e) {
            e.preventDefault();
            let data = $.form.get(form);

            if (typeof options.beforeSubmit === 'function') {
                try { if (options.beforeSubmit(data) === false) return false; } catch (err) { console && console.error && console.error(err); }
            }

            if (!$.form.validate(form)) {
                return false;
            }

            try {
                const result = callback(data);
                if (typeof options.afterSubmit === 'function') {
                    if (result && typeof result.then === 'function') {
                        result.then(function (res) { options.afterSubmit(res); }).catch(function (err) { console && console.error && console.error(err); });
                    } else {
                        options.afterSubmit(result);
                    }
                }
            } catch (err) {
                console && console.error && console.error(err);
            }
            return false;
        });

    },

    /**
     * 管理表单（获取和提交）
     * @param {string} uri - 接口地址
     * @param {string|HTMLElement|jQuery} form - 表单元素
     * @param {Object} [options] - 选项对象
     *   - options.beforeSet(response): 设置表单之前
     *   - options.afterSet(response): 设置表单之后
     *   - options.beforeSubmit(data): 提交表单之前，返回 false 可中断
     *   - options.afterSubmit(response): 提交表单之后
     */
    manage(uri, form, options){
        if (typeof form === "object") {
            form = form[0];
        }
        options = (typeof options === 'object' && options !== null) ? options : {};

        $.request.get(uri, {}, (response) => {
            if (response.code === 200){
                if (typeof options.beforeSet === 'function') {
                    try { options.beforeSet(response); } catch (e) { console && console.error && console.error(e); }
                }

                $.form.val(form, response.data);

                if (typeof options.afterSet === 'function') {
                    try { options.afterSet(response); } catch (e) { console && console.error && console.error(e); }
                }
            } else {
                $.toaster.error(response.msg);
            }
        });

        $.form.submit(form, {
            beforeSubmit: function (data) {
                if (typeof options.beforeSubmit === 'function') {
                    try { return options.beforeSubmit(data) !== false; } catch (e) { console && console.error && console.error(e); }
                }
                return true;
            },
            callback: function (data) {
                $.request.postForm(uri, data, function (response) {
                    if (response.code === 200){
                        $.toaster.success(response.msg);
                        if (typeof options.afterSubmit === 'function') {
                            try { options.afterSubmit(response); } catch (e) { console && console.error && console.error(e); }
                        }
                    } else {
                        $.toaster.error(response.msg);
                    }
                });
            }
        });

    },

    /**
     * 重置表单
     * @param {String} form - 表单元素
     */
    reset: function (form) {
        $(form)[0].reset();

        $(form).find("mdui-file-upload").each(function (key, item) {
            //item.setFiles([]);
             $(item).val('');
        });

        $(form).find("mdui-chip-group").each(function (key, item) {
            $(item).val([]);
        });

        $(form).find("mdui-area-picker").each(function (key, item) {
             $(item).val('');
        });
    },
    
    /**
     * 获取或设置表单值
     * @param {String} form - 表单元素
     * @param {Object} data - 要设置的数据，如果不提供则获取表单数据
     * @returns {Object|undefined} 如果获取数据则返回数据对象，否则返回undefined
     */
    val(form,data) {
        if (data) {
            $.form.set(form,data);
        } else {
            return $.form.get(form);
        }
    },

    /**
     * 动态设置 mdui-select 的选项
     * @param {String|HTMLElement|jQuery} select - 选择器或元素（mdui-select）
     * @param {Array|Object} items - 选项数组（对象或 {value,label,disabled}）或映射对象（value->label）
     * @param {Object} [mapping] - 字段映射
     *   - mapping.valueKey: 默认 'value'
     *   - mapping.labelKey: 默认 'label'
     *   - mapping.disabledKey: 默认 'disabled'
     * 未提供 mapping 时，若 items 为对象，将按 key->value 作为 value->label 生成选项
     */
    setSelectOptions: function (select, items, mapping) {
        const map = Object.assign({ valueKey: 'value', labelKey: 'label', disabledKey: 'disabled' }, mapping);
        const $select = $(select);
        if ($select.length === 0) return;
        const el = $select[0];
        if (!$select.is('mdui-select')) return;

        // 将对象映射转换为数组（仅当未提供 mapping 时）
        let list = items || [];
        const isPlainObject = list && typeof list === 'object' && !Array.isArray(list);
        if (!mapping && isPlainObject) {
            list = Object.keys(list).map(function (key) {
                return { value: key, label: list[key] };
            });
        }

        // 清空现有选项
        $select.empty();

        // 生成新选项
        (list || []).forEach(function (item) {
            const isObj = item && typeof item === 'object';
            const value = isObj ? item[map.valueKey] : item;
            const label = isObj ? item[map.labelKey] : String(item);
            const disabled = isObj ? !!item[map.disabledKey] : false;
            const $mi = $('<mdui-menu-item>');
            if (value !== undefined && value !== null) {
                $mi.attr('value', String(value));
            }
            if (disabled) {
                $mi.attr('disabled', 'disabled');
            }
            $mi.text(label == null ? '' : String(label));
            $select.append($mi);
        });

        // 触发一次变更，便于组件刷新
        $($select).trigger('change');
    }
}
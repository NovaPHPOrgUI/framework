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
     * @param {HTMLElement|jQuery} form - 表单元素
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
     * @param {HTMLElement|jQuery} form - 表单元素
     * @param {Object} data - 要设置的数据对象
     * @param {boolean} disabled - 是否禁用表单元素
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
     * @param {HTMLElement|jQuery} form - 表单元素
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
     * @param {HTMLElement|jQuery|String} form - 表单元素
     * @param {Function} [callback] - 提交回调函数
     * @param {Function} [beforeSubmit] - 提交前回调函数
     */
    submit: function (form, callback, beforeSubmit) {
        if (typeof form === "object") {
            form = form[0];
        }

        if (!callback) {
            $(form).trigger('submit');
            return;
        }
        $(form).on("submit",function (e) {
            e.preventDefault();
            let data = $.form.get(form);
            if (beforeSubmit && !beforeSubmit(data)) {
                return false;
            }
            if (!$.form.validate(form)) {
                return false;
            }

            callback(data);
            return false;
        });

    },

    /**
     * 管理表单（获取和提交）
     * @param {string} uri - 接口地址
     * @param {HTMLElement|jQuery|String} form - 表单元素
     * @param {Function} [callback] - 回调函数
     * @param {Function} [beforeSubmit] - 提交前回调函数
     */
    manage(uri,form,callback,beforeSubmit){
        if (typeof form === "object") {
            form = form[0];
        }
        $.request.get(uri,{},(response) => {
            if (response.code === 200){
                $.form.val(form,response.data);
                if(callback){
                    callback(response,'get')
                }
            }else{
                $.toaster.error(response.msg);
            }
        });

        $.form.submit(form,(data) => {
            $.request.postForm(uri,data,(response) => {
                if (response.code === 200){
                    $.toaster.success(response.msg);
                    if (callback){
                        callback(response,'post');
                    }
                }else{
                    $.toaster.error(response.msg);
                }
            },beforeSubmit);
        });

    },

    /**
     * 重置表单
     * @param {HTMLElement|jQuery} form - 表单元素
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
     * @param {HTMLElement|jQuery} form - 表单元素
     * @param {Object} data - 要设置的数据，如果不提供则获取表单数据
     * @returns {Object|undefined} 如果获取数据则返回数据对象，否则返回undefined
     */
    val(form,data) {
        if (data) {
            $.form.set(form,data);
        } else {
            return $.form.get(form);
        }
    }
}
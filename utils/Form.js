/*
 * Copyright (c) 2025. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

let formElems = "mdui-text-field,mdui-switch,mdui-checkbox,mdui-radio-group,mdui-select,mdui-slider,mdui-file-upload,mdui-area-picker,mdui-range-slider,mdui-chip-group,mdui-date-picker"
$.form = {

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

    manage(uri,form,callback,beforeSubmit){
        if (typeof form === "object") {
            form = form[0];
        }
        $.request.get(uri,{},(response) => {
            if (response.code === 200){
                $.form.val(form,response.data);
            }else{
                $.toaster.error(response.msg);
            }
        });

        $.form.submit(form,(data) => {
            $.request.postForm(uri,data,(response) => {
                if (response.code === 200){
                    $.toaster.success(response.msg);
                    if (callback){
                        callback(response);
                    }
                }else{
                    $.toaster.error(response.msg);
                }
            },beforeSubmit);
        });

    },

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
    val(form,data) {
        if (data) {
            $.form.set(form,data);
        } else {
            return $.form.get(form);
        }
    }
}
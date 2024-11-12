let formElems = "mdui-text-field,mdui-switch,mdui-checkbox,mdui-radio-group,mdui-select,mdui-slider,file-upload"
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
                $(this).prop("checked", value === 1);
            } else if ($(this).is("mdui-area-picker")) {
                $(this).val(value);
                // 设置disabled-levels属性基于数组中非空元素的数量
                let nonEmptyLevels = value.filter(item => item !== null && item !== '').length;
                $(this).attr('disabled-levels', nonEmptyLevels);
            } else if ($(this).is("mdui-range-slider")) {
                $(this).val(value[0]); // 假设value[0]是当前值
                if (disabled){
                    $(this).attr('min', value[1]); // 假设value[1]是最小值
                    $(this).attr('max', value[2]); // 假设value[2]是最大值
                }

            } else {
                $(this).val(value);
            }
            // 如果disabled为true，则禁用元素
            if (disabled && !$(this).is("mdui-range-slider")) { // 不禁用mdui-range-slider
                $(this).prop('disabled', true);
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
    reset: function (form) {
        $(form)[0].reset();

        $(form).find("mdui-file-upload").each(function (key, item) {
            //item.setFiles([]);
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
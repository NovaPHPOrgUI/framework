let formElems = "mdui-text-field,mdui-switch,mdui-checkbox,mdui-radio-group,mdui-select,mdui-slider,file-upload"
$.form = {

    get: function (form) {
        let data = $(form).serializeObject();

        //file upload

        $(form).find("file-upload").each(function (key, item) {
            let name = $(item).attr("name");
            data[name] = $(item).val();
        });

        $(form).find("mdui-switch").each(function (key, item) {
            let name = $(item).attr("name");
            data[name] = $(item).prop("checked")?1:0;
        });

        return data;
    },
    set: function (form, data) {
        $(form).find(formElems).each(function () {
            let name = $(this).attr("name");
            let value = data[name];
            if(value === undefined)return;
            if ($(this).is("mdui-checkbox")) {
                if (value instanceof Array) {
                    if (value.indexOf($(this).val()) !== -1) {
                        $(this).prop("checked", true);
                    }
                }
            } else if ($(this).is("mdui-switch")) {
                if (value === 1) {
                    $(this).prop("checked", true);
                }else {
                    $(this).prop("checked", false);
                }
            } else{
                $(this).val(value);
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

        $(form).find("file-upload").each(function (key, item) {
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
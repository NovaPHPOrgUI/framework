class Toaster {
    createSnackbar(message, color, params = {}) {
        let id = "snackbar" + Math.random().toString(36).substring(2);
        let html = `<mdui-snackbar class="bg-${color}" id="${id}"`;

        let keys = Object.keys(params);
        for (let key of keys) {
            html += ` ${key}="${params[key]}"`;
        }

        html += `>${message}</mdui-snackbar>`;

        let timeout = params["auto-close-delay"] || 5000;

        let snackbarDiv = document.createElement("div");
        snackbarDiv.innerHTML = html;

        let snackbar = snackbarDiv.querySelector("#" + id);
        snackbar.open = true;
        document.body.appendChild(snackbarDiv);
        setTimeout(() => {
            snackbarDiv.remove();
        }, timeout);
    }

    info(message, params) {
        this.createSnackbar(message, "info", params);
        $.logger.info(message);
    }

    warn(message, params) {
        this.createSnackbar(message, "warning", params);
        $.logger.warn(message);
    }

    error(message, params) {
        this.createSnackbar(message, "error", params);
        $.logger.error(message);
    }

    success(message, params) {
        this.createSnackbar(message, "success", params);
        $.logger.success(message);
    }
}

// 示例使用
$.toaster = new Toaster();
$.confirm = mdui.confirm;
$.alert  = mdui.alert;
$.prompt = mdui.prompt;

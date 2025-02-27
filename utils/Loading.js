

/*
 * Copyright (c) 2025. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

let fade = {

    out(container, callback) {
        if (container === null) {
            if (callback) {
                callback();
            }
            return;
        }
        container.classList.add("fade-leave-active");
        if (callback) {
            setTimeout(function () {
                callback();
            }, 500);
        }
    },
    in(container, callback) {
        if (container === null) {
            if (callback) {
                callback();
            }
            return;
        }
        container.classList.remove("fade-leave-active");
        container.classList.add("fade-enter");
        setTimeout(function () {
            container.classList.remove("fade-enter");
            container.classList.add("fade-enter-active");
            if (callback) {
                setTimeout(function () {
                    callback();
                }, 5000);
            }
        }, 10);
    },
};
$.fade = fade;

//加载动画
class Loading {
    constructor(container, text = "") {
        try {
            if (typeof container === "string") {
                container = document.querySelector(container);
            }
            this.container = container;
            this.overlayElement = document.createElement("div");
            this.overlayElement.className = "loading-overlay fade-leave-active";

            // 使用 mdui-circular-progress
            this.loadingElement = document.createElement("mdui-circular-progress");
            this.loadingElement.setAttribute("indeterminate", "");
            this.loadingElement.setAttribute("max", 100)
            this.loadingElement.style.position = "absolute";
            if (text === ""){
                this.loadingElement.style.top = "calc(50%)";
            }else{
                this.loadingElement.style.top = "calc(50% - 20px)";
            }
            this.loadingElement.style.left = "50%";
            this.loadingElement.style.transform = "translate(-50%, -50%)";

            // 创建文字元素
            this.textElement = document.createElement("div");
            this.textElement.className = "loading-text";
            this.setText(text);

            this.overlayElement.appendChild(this.loadingElement);
            this.overlayElement.appendChild(this.textElement);
        } catch (e) {
            console.error("Loading 构造函数错误:", e);
        }
    }



    setProgress(progress) {
        this.loadingElement.setAttribute("value", progress);
    }

    setText(text) {
        this.textElement.textContent = text;
    }

    show() {
        try {
            this.container.appendChild(this.overlayElement);
            fade.in(this.overlayElement);
        } catch (e) {
            console.error("Loading show 方法错误:", e);
        }
    }


    close() {
        try {
            let that = this;
            fade.out(this.overlayElement, function () {
                window.dispatchEvent(new Event("resize"));
                $.emitter.emit("translate:start");
                that.overlayElement.remove();
            });
        } catch (e) {
            console.error("Loading close 方法错误:", e);
        }
    }
}

window.loading = new Loading(document.body);
window.loading.show();

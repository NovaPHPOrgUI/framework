//渐入渐出动画
function isShadowDom(element) {
    if (element instanceof ShadowRoot) {
        return true;
    }
    return element.getRootNode() instanceof ShadowRoot;
}

function getShadowDomRoot(element) {
    if (element instanceof ShadowRoot) {
        return element.host;
    }
    if (element.getRootNode() instanceof ShadowRoot) {
        return element.getRootNode().host;
    }
    return document.head;
}

let fade = {


    applyStyle(container) {

        let containerNode = getShadowDomRoot(container);



        // 检查是否存在样式
        if (containerNode.querySelector("style#fade")) {
            return;
        }


        let style = `<style id="#fade">
.fade-enter-active {
    opacity: 1;
    transition: opacity 0.5s;
}
.fade-enter {
    opacity: 0;
}

/* 定义退出动画 */
.fade-leave-active {
    opacity: 0;
    transition: opacity 0.5s;
}
.fade-leave {
    opacity: 1;
}
    .loading-text {
  position: absolute;
  top: calc(50% + 40px);
  left: 50%;
  transform: translateX(-50%);
  color: rgba(var(--mdui-color-primary));
  font-size: 1rem;
  text-align: center;
}<style>`;

        containerNode.insertAdjacentHTML("afterbegin", style);
    },
    out(container, callback) {
        this.applyStyle(container);
        container.classList.add("fade-leave-active");
        if (callback) {
            setTimeout(function () {
                callback();
            }, 500);
        }
    },
    in(container, callback) {
        this.applyStyle(container);
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
            this.applyStyle();
            this.overlayElement = document.createElement("div");
            this.overlayElement.className = "loading-overlay fade-leave-active";

            // 使用 mdui-circular-progress
            this.loadingElement = document.createElement("mdui-circular-progress");
            this.loadingElement.setAttribute("indeterminate", "");
            this.loadingElement.setAttribute("max", 100)
            this.loadingElement.style.position = "absolute";
            this.loadingElement.style.top = "calc(50% - 20px)";
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


    applyStyle() {
        // 判断是否为shadowRoot
        let styleContainer = getShadowDomRoot(this.container);

        if (styleContainer.querySelector("style#loading"))
            return;
        let style = `<style id="loading">
/** Loading */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color:  rgba(var(--mdui-color-background)); /* 半透明的黑色背景 */
    z-index: 2000; /* 确保遮罩层在其他内容之上 */
    overflow: hidden;
    max-height: var(--vh);
}
</style>`;
        styleContainer.insertAdjacentHTML("afterend", style);
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

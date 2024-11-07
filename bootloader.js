window.$ = mdui.$;
window.jQuery = $;
const currentScript = document.currentScript.src;
// 提取当前脚本的目录路径
let dir = currentScript.substring(0, currentScript.lastIndexOf("/"));
$.scriptDir = dir.substring(0, dir.lastIndexOf("/"));
window.baseUri = $.scriptDir.substring(0, $.scriptDir.lastIndexOf("/"));

if (!window.novaFiles) {
    window.novaFiles = {};
}
window.pageOnLoad = function (loading) {
    return false;
};
window.pageOnUnLoad = function () {
};
window.pageLoadFiles = [];

window.jsMap = {
    Event: '/framework/utils/Event.js',
    Form: '/framework/utils/Form.js',
    Loader: '/framework/utils/Loader.js',
    Loading: '/framework/utils/Loading.js',
    Logger: '/framework/utils/Logger.js',
    Request: '/framework/utils/Request.js',
    Toaster: '/framework/utils/Toaster.js',

    URLUtils: '/framework/utils/URLUtils.js',
    // Components
    ThemeSwitcher: '/components/theme/ThemeSwitcher.js',

    Language: '/components/language/Language.js',
    TranslateUtils: '/components/language/TranslateUtils.js',

    ImageLoader: '/components/imageLoader/ImageLoader.js',

    Pjax:[
        '/components/pjax/nprogress.css',
        '/components/pjax/nprogress.js',
        '/components/pjax/pjax.min.js',
        '/components/pjax/PjaxUtils.js'
    ]
}
window.debug = true;
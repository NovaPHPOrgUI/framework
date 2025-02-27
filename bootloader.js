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
// 适配移动端
let result = vhCheck();
if (result.isNeeded) {
    document.documentElement.style.setProperty(
        `--vh-offset`,
        `${result.offset}px`
    )
}
window.jsMap = {
    Event: '/framework/utils/Event.js',
    Form: '/framework/utils/Form.js',
    Loader: '/framework/utils/Loader.js',
    Loading: [
        '/framework/utils/Loading.js',
        '/framework/utils/Loading.css'
    ],
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
    ],
    DialogForm: "/components/formDialog/DialogForm.js",
    ChipGroup: "/components/chipGroup/mduiChipGroup.js",
    AreaPicker: "/components/areaPicker/AreaPicker.js",
    ImageViewer: [
        "/components/viewer/ImageViewer.js",
        "/components/viewer/ImageViewer.css",
    ],
    FileUploader: [
        "/components/fileUpload/FileUpload.js"
    ],
    DataTable: [
        "/components/dataTable/Pagination.js",
        "/components/dataTable/gridManager.js",
        "/components/dataTable/datatable.css",
        '/components/dataTable/DataTable.js',
        '/framework/utils/URLUtils.js',
    ],
    DatePicker: "/components/datepicker/datepicker.js",
    Markdown: "/components/markdown/Markdown.js",
}
window.debug = true;
window.version = "";
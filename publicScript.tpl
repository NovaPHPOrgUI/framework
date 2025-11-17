{* 框架核心Bundle - 合并了7个文件减少HTTP请求 *}
<script src="/static/bundle?file=framework/bootloader.js,framework/utils/Loading.js,framework/utils/Logger.js,framework/utils/Loader.js,framework/utils/Event.js,framework/utils/Toaster.js,framework/utils/Request.js&type=js&v={$__v}"></script>
<script>
    window._v = "{$__v}"
    let level = debug ? 'debug' : 'error';
    mdui.setColorScheme('#fddefc');

    $.logger.setLevel(level);
    $.logger.info('App is running in ' + level + ' mode');
    $.preloader([
        'Loading',
        'Logger',
        'Event',
        'Toaster',
        'Request',
        'ThemeSwitcher',
        'Language'
    ]);
    window.loading && window.loading.close();
    $.request.setBaseUrl(baseUri).setOnCode(401,()=>{
        $.toaster.error('登录已过期，请重新登录');
        setTimeout(()=>{
            window.location.href = '/login';
        },1000);
    });
</script>

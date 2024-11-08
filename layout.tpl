
<!doctype html>
<html lang="zh-CN" class="mdui-theme-auto">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no"/>
    <meta name="renderer" content="webkit"/>

    <link rel="shortcut icon" href="/static/favicon.ico">
    <title id="title">Nova-admin</title>
    <link rel="stylesheet" href="/static/framework/libs/mdui.css">
    <link rel="stylesheet" href="/static/framework/base.css">
    <script src="/static/framework/libs/mdui.global.min.js"></script>
    <script src="/static/framework/libs/vhcheck.min.js"></script>
    <link rel="stylesheet" href="/static/framework/icons/fonts.css">
    {*<link rel="stylesheet" href="/static/main.css">*}
    <style id="style">
    </style>
</head>
    <body >
    <script src="/static/framework/bootloader.js"></script>
    <script src="/static/framework/utils/Loading.js"></script>
    <script src="/static/framework/utils/Logger.js"></script>
    <script src="/static/framework/utils/Loader.js"></script>
    <script src="/static/framework/utils/Event.js"></script>
    <script src="/static/framework/utils/Toaster.js"></script>
    <script src="/static/framework/utils/Request.js"></script>

    <script>
        let level = debug ? 'debug' : 'error';
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
        $.request.setBaseUrl(baseUri);
        $.request.setHeaders(headers);
    </script>
    <script src="/static/init.js"></script>
    <div class="container">

    </div>
</html>

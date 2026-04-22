/**
 * 精简版时间函数工具
 */
(function (window) {
    const $ = window.$ || (window.$ = {});

    // 核心工具函数
    const timing = {
        /**
         * 防抖函数
         * @param {Function} fn - 需要执行的函数
         * @param {number} wait - 延迟时间 (ms)
         * @returns {Function} 返回包装后的函数（需要手动调用）
         *
         * 使用说明：
         * 1) 先创建一次防抖函数，再在事件里调用它。
         *    const onInputDebounced = $.debounce(function (keyword) {
         *        console.log('search:', keyword);
         *    }, 300);
         *    $('#kw').on('input', function () {
         *        onInputDebounced($(this).val());
         *    });
         *
         * 2) 不要在事件回调内部每次重新创建 debounce：
         *    // 错误示例（每次 input 都会新建，且常见写法还会忘记调用返回函数）
         *    $('#kw').on('input', function () {
         *        $.debounce(function () { ... }, 300);
         *    });
         */
        debounce(fn, wait = 300) {
            let timer = null;
            return function (...args) {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    fn.apply(this, args);
                }, wait);
            };
        },

        /**
         * 节流：固定频率执行
         */
        throttle(fn, wait = 300) {
            let previous = 0;
            return function (...args) {
                const now = Date.now();
                if (now - previous > wait) {
                    previous = now;
                    fn.apply(this, args);
                }
            };
        }
    };

    // 挂载到 $ 对象
    $.debounce = timing.debounce;
    $.throttle = timing.throttle;
    $.timing = timing; // 保留命名空间备份

})(window);
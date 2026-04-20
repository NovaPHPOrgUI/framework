/**
 * 精简版时间函数工具
 */
(function (window) {
    const $ = window.$ || (window.$ = {});

    // 核心工具函数
    const timing = {
        /**
         * 防抖：多次触发，只执行最后一次
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
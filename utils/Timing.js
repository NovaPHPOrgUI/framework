/**
 * 时间函数工具
 * 提供防抖与节流能力，并挂载到全局 $ 对象
 * @file Timing.js
 * @author License Auto System
 * @version 1.0.0
 */

(function (window) {
    const $ = window.$ || (window.$ = {});

    function normalizeWait(wait) {
        const delay = Number(wait);
        return Number.isFinite(delay) && delay >= 0 ? delay : 0;
    }

    function createDebounce(fn, wait = 0) {
        if (typeof fn !== 'function') {
            throw new TypeError('$.debounce 需要传入函数');
        }

        const delay = normalizeWait(wait);
        let timerId = null;
        let lastArgs;
        let lastThis;
        let lastResult;

        function invoke() {
            timerId = null;
            lastResult = fn.apply(lastThis, lastArgs);
            lastArgs = undefined;
            lastThis = undefined;
            return lastResult;
        }

        function debounced(...args) {
            lastArgs = args;
            lastThis = this;

            if (timerId !== null) {
                window.clearTimeout(timerId);
            }

            timerId = window.setTimeout(invoke, delay);
            return lastResult;
        }

        debounced.cancel = function () {
            if (timerId !== null) {
                window.clearTimeout(timerId);
            }
            timerId = null;
            lastArgs = undefined;
            lastThis = undefined;
        };

        debounced.flush = function () {
            if (timerId === null) {
                return lastResult;
            }

            window.clearTimeout(timerId);
            return invoke();
        };

        return debounced;
    }

    function createThrottle(fn, wait = 0) {
        if (typeof fn !== 'function') {
            throw new TypeError('$.throttle 需要传入函数');
        }

        const delay = normalizeWait(wait);
        let timerId = null;
        let lastCallTime = 0;
        let lastArgs;
        let lastThis;
        let lastResult;

        function invoke() {
            lastCallTime = Date.now();
            timerId = null;
            lastResult = fn.apply(lastThis, lastArgs);
            lastArgs = undefined;
            lastThis = undefined;
            return lastResult;
        }

        function throttled(...args) {
            const now = Date.now();
            const remaining = delay - (now - lastCallTime);

            lastArgs = args;
            lastThis = this;

            if (remaining <= 0 || remaining > delay) {
                if (timerId !== null) {
                    window.clearTimeout(timerId);
                    timerId = null;
                }
                return invoke();
            }

            if (timerId === null) {
                timerId = window.setTimeout(invoke, remaining);
            }

            return lastResult;
        }

        throttled.cancel = function () {
            if (timerId !== null) {
                window.clearTimeout(timerId);
            }
            timerId = null;
            lastArgs = undefined;
            lastThis = undefined;
        };

        throttled.flush = function () {
            if (timerId === null) {
                return lastResult;
            }

            window.clearTimeout(timerId);
            return invoke();
        };

        return throttled;
    }

    $.timing = $.timing || {};
    $.timing.debounce = $.timing.debounce || createDebounce;
    $.timing.throttle = $.timing.throttle || (typeof $.throttle === 'function' ? $.throttle : createThrottle);

    $.debounce = $.debounce || function (fn, wait) {
        return $.timing.debounce(fn, wait);
    };

    $.throttle = $.throttle || function (fn, wait) {
        return $.timing.throttle(fn, wait);
    };
})(window);


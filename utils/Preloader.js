/**
 * 预加载缓存器
 *
 * 按 key 缓存异步请求的 Promise：命中即复用（去重），失败自动移除（可重试）。
 * 与请求方式无关——「如何取数据」通过 loader 注入，可承载 PJAX 片段、JSON 接口等任意异步源。
 * 典型用法：悬停 prefetch 预热缓存，点击 fetch 直接命中，省去等待。
 *
 * @example
 *   const pre = new Preloader((path) => new Promise((resolve, reject) => {
 *       $.request.get('/api/doc/' + path, {}, resolve, () => reject());
 *   }));
 *   el.addEventListener('mouseover', () => pre.prefetch(path)); // 悬停预取
 *   pre.fetch(path).then(render).catch(showError);             // 点击命中
 *
 * @file Preloader.js
 */
class Preloader {
    /**
     * @param {(key: string) => Promise<any>} loader 按 key 发起请求，返回 Promise；reject 表示失败
     */
    constructor(loader) {
        if (typeof loader !== 'function') {
            throw new Error('Preloader 需要一个 loader 函数');
        }
        this.loader = loader;
        /** @type {Map<string, Promise<any>>} key -> 进行中或已完成的 Promise */
        this.cache = new Map();
    }

    /**
     * 取数据：命中缓存复用同一 Promise；否则发起请求并缓存。失败时移除缓存以便重试。
     * @param {string} key
     * @returns {Promise<any>}
     */
    fetch(key) {
        const cached = this.cache.get(key);
        if (cached) {
            return cached;
        }
        const promise = this.loader(key).catch((err) => {
            this.cache.delete(key);
            throw err;
        });
        this.cache.set(key, promise);
        return promise;
    }

    /**
     * 预取：触发请求填充缓存，忽略结果与错误（悬停等场景）。
     * @param {string} key
     */
    prefetch(key) {
        if (!key) {
            return;
        }
        this.fetch(key).catch(() => {});
    }

    /**
     * 丢弃缓存，下次 fetch 会重新请求。
     * @param {string} [key] 省略则清空全部
     */
    clear(key) {
        if (key === undefined) {
            this.cache.clear();
        } else {
            this.cache.delete(key);
        }
    }
}

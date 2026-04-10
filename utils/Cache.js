class Cache {
    /**
     * @param {Object} options
     * @param {string} options.prefix 命名空间，防止多实例冲突
     * @param {number} options.max 最大条数 (LRU)
     * @param {number} options.ttl 过期时间(ms)，0 为永不过期
     * @param {Storage} options.storage 存储引擎 (localStorage/sessionStorage)
     */
    constructor({ prefix = 'default', max = 100, ttl = 0, storage = window.localStorage } = {}) {
        this.max = max;
        this.ttl = ttl;
        this.storage = storage;
        this.namespace = `cache_${prefix}_`;

        // Map 在 JS 中天然记录插入顺序，非常适合做 LRU
        this.memory = new Map();

        if (this.storage) {
            this._init();
        }
    }

    // 设置缓存
    set(key, value, customTTL = null) {
        const selectedTTL = customTTL !== null ? customTTL : this.ttl;
        // 0 为永不过期，使用最大安全整数模拟
        const expireAt = selectedTTL === 0 ? Number.MAX_SAFE_INTEGER : Date.now() + selectedTTL;
        const entry = { value, expireAt };

        // LRU 逻辑：如果存在先删除，确保新插入的在 Map 末尾（最新）
        if (this.memory.has(key)) {
            this.memory.delete(key);
        } else if (this.memory.size >= this.max) {
            // 淘汰最旧的（Map 的第一个元素）
            const oldestKey = this.memory.keys().next().value;
            this.delete(oldestKey);
        }

        this.memory.set(key, entry);

        if (this.storage) {
            try {
                this.storage.setItem(`${this.namespace}${key}`, JSON.stringify(entry));
            } catch (e) {
                // 空间满了尝试清理过期数据
                this.clearExpired();
            }
        }
    }

    // 获取缓存
    get(key) {
        let entry = this.memory.get(key);

        // 内存没命中，查持久化存储
        if (!entry && this.storage) {
            const raw = this.storage.getItem(`${this.namespace}${key}`);
            if (raw) {
                try {
                    entry = JSON.parse(raw);
                    this.memory.set(key, entry);
                } catch (e) { return null; }
            }
        }

        if (!entry) return null;

        // 过期检查
        if (Date.now() > entry.expireAt) {
            this.delete(key);
            return null;
        }

        // 活跃度刷新：移动到 Map 末尾
        this.memory.delete(key);
        this.memory.set(key, entry);

        return entry.value;
    }

    delete(key) {
        this.memory.delete(key);
        this.storage?.removeItem(`${this.namespace}${key}`);
    }

    // 仅清理当前命名空间下的过期数据
    clearExpired() {
        if (!this.storage) return;

        // 现代浏览器可以直接通过 Object.keys 遍历 Storage
        Object.keys(this.storage)
            .filter(k => k.startsWith(this.namespace))
            .forEach(k => {
                try {
                    const { expireAt } = JSON.parse(this.storage.getItem(k));
                    if (Date.now() > expireAt) this.storage.removeItem(k);
                } catch (e) {}
            });
    }

    _init() {
        this.clearExpired();
    }
}
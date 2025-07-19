(function (win) {
    'use strict';
  
    // ---------------------------------------------------------------------------
    // Toaster -------------------------------------------------------------------
    // ---------------------------------------------------------------------------
    /**
     * Toaster 类 - 用于显示消息提示的组件
     * 提供 info、warn、error、success 四种类型的消息提示
     * @class Toaster
     */
    class Toaster {
      /**
       * 创建 Toaster 实例
       * @constructor
       */
      constructor () {
        /** @type {number} 默认超时时间（毫秒） */
        this.defaultTimeout = 5000;
      }
  
      /**
       * 核心渲染方法 - 显示消息提示
       * @private
       * @param {string} type - 消息类型 ('info', 'warning', 'error', 'success')
       * @param {string} message - 要显示的消息内容
       * @param {Object} options - 配置选项
       * @param {number} [options.timeout=this.defaultTimeout] - 显示超时时间（毫秒）
       * @param {Object} [options.attrs] - 额外的 HTML 属性
       */
      _show (type, message, {timeout = this.defaultTimeout, ...attrs} = {}) {
        const id      = `snackbar-${(win.crypto?.randomUUID?.() ?? Date.now().toString(36))}`;
        const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  
        const wrapper      = document.createElement('div');
        wrapper.innerHTML  = `<mdui-snackbar id="${id}" class="bg-${type}" ${attrStr}>${message}</mdui-snackbar>`;
        const snackbar     = wrapper.firstElementChild;
        snackbar.open      = true;
        document.body.appendChild(wrapper);
        setTimeout(() => wrapper.remove(), timeout);
      }
  
      /**
       * 显示信息提示
       * @param {string} msg - 消息内容
       * @param {Object} [opt] - 配置选项
       * @param {number} [opt.timeout] - 显示超时时间（毫秒）
       * @param {Object} [opt.attrs] - 额外的 HTML 属性
       */
      info    (msg, opt) { this._show('info',    msg, opt); win.$?.logger?.info?.(msg);    }
      
      /**
       * 显示警告提示
       * @param {string} msg - 消息内容
       * @param {Object} [opt] - 配置选项
       * @param {number} [opt.timeout] - 显示超时时间（毫秒）
       * @param {Object} [opt.attrs] - 额外的 HTML 属性
       */
      warn    (msg, opt) { this._show('warning', msg, opt); win.$?.logger?.warn?.(msg);    }
      
      /**
       * 显示错误提示
       * @param {string} msg - 消息内容
       * @param {Object} [opt] - 配置选项
       * @param {number} [opt.timeout] - 显示超时时间（毫秒）
       * @param {Object} [opt.attrs] - 额外的 HTML 属性
       */
      error   (msg, opt) { this._show('error',   msg, opt); win.$?.logger?.error?.(msg);   }
      
      /**
       * 显示成功提示
       * @param {string} msg - 消息内容
       * @param {Object} [opt] - 配置选项
       * @param {number} [opt.timeout] - 显示超时时间（毫秒）
       * @param {Object} [opt.attrs] - 额外的 HTML 属性
       */
      success (msg, opt) { this._show('success', msg, opt); win.$?.logger?.success?.(msg); }
    }
  
    // Expose as $.toaster --------------------------------------------------------
    win.$ = win.$ || {};
    /** @type {Toaster} 全局 Toaster 实例 */
    win.$.toaster = new Toaster();

    win.$.copy =  function(text) {
        if (navigator.clipboard?.writeText) {
            try {
                navigator.clipboard.writeText(text);
                return true;
            } catch (_) {
            }
        }
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = 0;
        document.body.appendChild(ta);
        ta.select();
        try {
            return document.execCommand('copy');
        } finally {
            document.body.removeChild(ta);
        }
    }
    win.$.formatDateTime =  function (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
})(window);
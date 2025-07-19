/**
 * Layer 弹层组件——全自定义 Header/Body/Footer，使用 MDUI 按钮图标
 * @module Layer
 * @description 基于MDUI Dialog的弹层组件，提供alert、confirm、msg、load、html、iframe等常用弹层功能
 * @author 系统
 * @version 1.0.0
 */
(function (win) {
  'use strict';

  const { dialog } = win.mdui;
  /** @type {number} 弹层实例 ID 计数 */
  let uid = 0;
  /** @type {Map<number, Object>} 实例缓存 */
  const cache = new Map();

  /**
   * 创建并打开一个 Dialog
   * @param {Object} opts - 弹层配置选项
   * @param {string} [opts.title=''] - 弹层标题
   * @param {string} [opts.content=''] - 弹层内容（HTML）
   * @param {Array<Object>} [opts.buttons=[]] - 按钮列表
   * @param {string} opts.buttons[].text - 按钮文本
   * @param {Function} [opts.buttons[].onClick] - 按钮点击回调
   * @param {boolean} [opts.closeBtn=true] - 是否显示右上角关闭按钮
   * @param {string} [opts.className=''] - 自定义 class
   * @param {string} [opts.style=''] - 自定义 style
   * @param {Function} [opts.onOpen] - 弹层打开时的回调函数
   * @param {Function} [opts.onClosed] - 弹层关闭时的回调函数
   * @param {...*} opts.rest - 其余 dialog API 支持的选项
   * @returns {number} 弹层实例ID
   * @private
   */
  function createDialog(opts) {
    const id = ++uid;
    const {
      title = '',                     // 弹层标题
      content = '',                   // 弹层内容（HTML）
      buttons = [],                   // 按钮列表：[{ text, onClick }]
      closeBtn = true,                // 是否显示右上角关闭按钮
      className = '',                 // 自定义 class
      style = '',                     // 自定义 style
      onOpen: userOnOpen,
      onClosed: userOnClosed,
      ...rest                         // 其余 dialog API 支持的选项
    } = opts;

    // 构建 HTML
    let html = `<div class="layer-panel" style="position:relative;">`;

    // Header
    html += `<div class="layer-header headline-medium" style="padding:16px; font-weight:bold; border-bottom:1px solid #eee; position:relative;">`;
    html += `${title}`;
    if (closeBtn) {
      html += `
        <mdui-button-icon 
          class="layer-close" 
          icon="close" 
          style="position:absolute; top:16px; right:16px; cursor:pointer;">
        </mdui-button-icon>`;
    }
    html += `</div>`;

    // Body
    html += `<div class="layer-content" style="padding:16px;">${content}</div>`;

    // Footer
    if (buttons.length) {
      html += `<div class="layer-footer" style="padding:16px; border-top:1px solid #eee; text-align:right;">`;
      buttons.forEach((btn, i) => {
        html += `
          <mdui-button 
            class="layer-btn" 
            data-btn-index="${i}" 
            style="margin-left:8px;">
            ${btn.text}
          </mdui-button>`;
      });
      html += `</div>`;
    }

    html += `</div>`;

    // 调用 MDUI Dialog
    const inst = dialog({
      body:      html,
      className: className,
      style:     style,
      ...rest
    });
    cache.set(id, inst);

    // 打开时绑定事件
    inst.addEventListener('open', function () {
      // 关闭按钮
      if (closeBtn) {
        const x = this.querySelector('.layer-close');
        x && x.addEventListener('click', () => inst.open = false);
      }
      // 底部按钮
      buttons.forEach((btn, i) => {
        const el = this.querySelector(`[data-btn-index="${i}"]`);
        el && el.addEventListener('click', () => {
          btn.onClick?.();
          inst.open = false;
        });
      });
      userOnOpen?.call(this, inst);
    });

    // 关闭时清缓存
    inst.addEventListener('closed', function () {
      cache.delete(id);
      userOnClosed?.call(this, inst);
    });

    return id;
  }

  /**
   * Layer 弹层组件对外接口
   * @namespace layer
   */
  const layer = {
    /**
     * 显示提示弹层
     * @param {string} msg - 提示消息
     * @param {Function} [yes] - 确定按钮回调函数
     * @param {Object} [o={}] - 配置选项
     * @param {string} [o.title='提示'] - 弹层标题
     * @param {string} [o.btn='确定'] - 按钮文本
     * @returns {number} 弹层实例ID
     * @example
     * // 基本用法
     * $.layer.alert('操作成功！');
     * 
     * // 带回调
     * $.layer.alert('确认删除？', function() {
     *   console.log('用户点击了确定');
     * });
     * 
     * // 自定义配置
     * $.layer.alert('自定义标题', function() {
     *   // 回调
     * }, {
     *   title: '系统提示',
     *   btn: '知道了'
     * });
     */
    alert(msg, yes, o = {}) {
      return createDialog({
        title:   o.title || '提示',
        content: `<div>${msg}</div>`,
        buttons: [{ text: o.btn || '确定', onClick: yes }],
        ...o
      });
    },

    /**
     * 显示确认弹层
     * @param {string} msg - 确认消息
     * @param {Function} [yes] - 确定按钮回调函数
     * @param {Function} [no] - 取消按钮回调函数
     * @param {Object} [o={}] - 配置选项
     * @param {string} [o.title='确认'] - 弹层标题
     * @param {string} [o.btnConfirm='确定'] - 确定按钮文本
     * @param {string} [o.btnCancel='取消'] - 取消按钮文本
     * @returns {number} 弹层实例ID
     * @example
     * // 基本用法
     * $.layer.confirm('确认删除此文件？');
     * 
     * // 带回调
     * $.layer.confirm('确认删除？', function() {
     *   console.log('用户点击了确定');
     * }, function() {
     *   console.log('用户点击了取消');
     * });
     * 
     * // 自定义配置
     * $.layer.confirm('确认操作？', function() {
     *   // 确定回调
     * }, function() {
     *   // 取消回调
     * }, {
     *   title: '系统确认',
     *   btnConfirm: '是',
     *   btnCancel: '否'
     * });
     */
    confirm(msg, yes, no, o = {}) {
      return createDialog({
        title:   o.title || '确认',
        content: `<div>${msg}</div>`,
        buttons: [
          { text: o.btnCancel  || '取消', onClick: no  },
          { text: o.btnConfirm || '确定', onClick: yes }
        ],
        ...o
      });
    },

    /**
     * 显示消息提示（自动关闭）
     * @param {string} message - 消息内容
     * @param {number} [time=2000] - 显示时间（毫秒）
     * @param {Object} [o={}] - 配置选项
     * @returns {number} 弹层实例ID
     * @example
     * // 基本用法
     * $.layer.msg('操作成功！');
     * 
     * // 自定义显示时间
     * $.layer.msg('保存成功！', 3000);
     * 
     * // 自定义配置
     * $.layer.msg('自定义消息', 5000, {
     *   className: 'custom-msg'
     * });
     */
    msg(message, time = 2000, o = {}) {
      const id = createDialog({
        content:    `<div>${message}</div>`,
        closeBtn:   false,
        ...o
      });
      setTimeout(() => this.close(id), time);
      return id;
    },

    /**
     * 显示加载中弹层
     * @param {Object} [o={}] - 配置选项
     * @returns {number} 弹层实例ID
     * @example
     * // 基本用法
     * const loadingId = $.layer.load();
     * 
     * // 加载完成后关闭
     * setTimeout(() => {
     *   $.layer.close(loadingId);
     * }, 2000);
     * 
     * // 自定义配置
     * $.layer.load({
     *   title: '加载中...',
     *   className: 'custom-loading'
     * });
     */
    load(o = {}) {
      return createDialog({
        content:    '<mdui-spinner></mdui-spinner>',
        closeBtn:   false,
        ...o
      });
    },

    /**
     * 显示HTML内容弹层
     * @param {string} content - HTML内容
     * @param {Object} [o={}] - 配置选项
     * @param {string} [o.title=''] - 弹层标题
     * @returns {number} 弹层实例ID
     * @example
     * // 基本用法
     * $.layer.html('<div>自定义HTML内容</div>');
     * 
     * // 带标题
     * $.layer.html('<div>复杂HTML内容</div>', {
     *   title: '详细信息'
     * });
     * 
     * // 自定义样式
     * $.layer.html('<div>样式化内容</div>', {
     *   title: '自定义样式',
     *   className: 'custom-html-layer',
     *   style: 'width: 600px;'
     * });
     */
    html(content, o = {}) {
      return createDialog({ title: o.title || '', content: content, ...o });
    },

    /**
     * 显示iframe弹层
     * @param {string} src - iframe源地址
     * @param {Object} [o={}] - 配置选项
     * @param {string} [o.title=''] - 弹层标题
     * @returns {number} 弹层实例ID
     * @example
     * // 基本用法
     * $.layer.iframe('/api/detail');
     * 
     * // 带标题
     * $.layer.iframe('/api/detail', {
     *   title: '详细信息'
     * });
     * 
     * // 外部链接
     * $.layer.iframe('https://example.com', {
     *   title: '外部链接'
     * });
     */
    iframe(src, o = {}) {
      return createDialog({
        title:   o.title || '',
        content: `<iframe src="${src}" style="width:100%;height:100%;border:0;" loading="lazy"></iframe>`,
        ...o
      });
    },

    /**
     * 关闭指定弹层
     * @param {number} id - 弹层实例ID
     * @example
     * // 关闭指定弹层
     * const layerId = $.layer.alert('测试');
     * $.layer.close(layerId);
     */
    close(id) {
      cache.get(id)?.destroy();
    },

    /**
     * 关闭所有弹层
     * @example
     * // 关闭所有弹层
     * $.layer.closeAll();
     */
    closeAll() {
      cache.forEach(inst => inst.open = false);
    },
  };

  /**
   * 将layer组件挂载到全局window对象
   * @type {Object}
   * @property {Function} alert - 显示提示弹层
   * @property {Function} confirm - 显示确认弹层
   * @property {Function} msg - 显示消息提示
   * @property {Function} load - 显示加载中弹层
   * @property {Function} html - 显示HTML内容弹层
   * @property {Function} iframe - 显示iframe弹层
   * @property {Function} close - 关闭指定弹层
   * @property {Function} closeAll - 关闭所有弹层
   */
  win.$.layer = layer;
})(window);

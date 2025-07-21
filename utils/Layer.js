/**
 * Layer 弹层组件——全自定义 Header/Body/Footer，使用 MDUI 按钮图标
 * @module Layer
 * @description 基于MDUI Dialog的弹层组件，提供alert、confirm、msg、load、html、iframe等常用弹层功能
 * @author 系统
 * @version 1.0.0
 */

/**
 * Layer弹层配置选项
 * @typedef {Object} LayerOptions
 * @property {string} [title=''] - 弹层标题
 * @property {string} [content=''] - 弹层内容（HTML）
 * @property {Array<Object>} [buttons=[]] - 按钮列表
 * @property {string} buttons[].text - 按钮文本
 * @property {Function} [buttons[].onClick] - 按钮点击回调
 * @property {boolean} [closeBtn=true] - 是否显示右上角关闭按钮
 * @property {string} [className=''] - 自定义CSS类名
 * @property {string} [style=''] - 自定义内联样式
 * @property {Function} [onOpen] - 弹层打开时的回调函数
 * @property {Function} [onClosed] - 弹层关闭时的回调函数
 * @property {string} [btn='确定'] - 按钮文本（alert方法专用）
 * @property {string} [btnConfirm='确定'] - 确定按钮文本（confirm方法专用）
 * @property {string} [btnCancel='取消'] - 取消按钮文本（confirm方法专用）
 * @property {...*} [rest] - 其余MDUI Dialog API支持的选项
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
   * @param {LayerOptions} opts - 弹层配置选项
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
    html += `<div class="layer-header headline-medium" style=" font-weight:bold;  position:relative;">`;
    html += `${title}`;
    if (closeBtn) {
      html += `
        <mdui-button-icon 
          class="layer-close" 
          icon="close" 
          style="position:absolute; top:0; right:0rem; cursor:pointer;">
        </mdui-button-icon>`;
    }
    html += `</div>`;

    // Body
    html += `<div class="layer-content" style="padding: 1.5rem 0.5rem;">${content}</div>`;

    // Footer
    if (buttons.length) {
      html += `<div class="layer-footer" style="text-align:right;">`;
      buttons.forEach((btn, i) => {
        // 最多两个按钮，第一个用默认样式，第二个用outlined样式
        const variant = i === 1 ? '' : 'variant="outlined"';
        html += `
          <mdui-button 
            class="layer-btn" 
            data-btn-index="${i}" 
            ${variant}
            style="margin-left:0.5rem;">
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
        el && el.addEventListener('click', () =>
        {
          console.log(btn);
          if(btn.onClick) btn.onClick();
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
     * @param {LayerOptions} options - 配置选项
     * @param {string} options.msg - 提示消息
     * @param {Function} [options.yes] - 确定按钮回调函数
     * @param {string} [options.title='提示'] - 弹层标题
     * @param {string} [options.btn='确定'] - 按钮文本
     * @returns {number} 弹层实例ID
     * @example
     * // 基本用法
     * $.layer.alert({ msg: '操作成功！' });
     *
     * // 带回调
     * $.layer.alert({
     *   msg: '确认删除？',
     *   yes: function() {
     *     console.log('用户点击了确定');
     *   }
     * });
     *
     * // 自定义配置
     * $.layer.alert({
     *   msg: '自定义标题',
     *   yes: function() {
     *     // 回调
     *   },
     *   title: '系统提示',
     *   btn: '知道了',
     *   className: 'custom-alert',
     *   style: 'width: 400px;'
     * });
     */
    alert(options = {}) {
      const { msg, yes, title = '提示', btn = '确定', ...rest } = options;
      return createDialog({
        title:   title,
        content: `<div>${msg}</div>`,
        buttons: [{ text: btn, onClick: yes }],
        ...rest
      });
    },

    /**
     * 显示确认弹层
     * @param {LayerOptions} options - 配置选项
     * @param {string} options.msg - 确认消息
     * @param {Function} [options.yes] - 确定按钮回调函数
     * @param {Function} [options.no] - 取消按钮回调函数
     * @param {string} [options.title='确认'] - 弹层标题
     * @param {string} [options.btnConfirm='确定'] - 确定按钮文本
     * @param {string} [options.btnCancel='取消'] - 取消按钮文本
     * @returns {number} 弹层实例ID
     * @example
     * // 基本用法
     * $.layer.confirm({ msg: '确认删除此文件？' });
     *
     * // 带回调
     * $.layer.confirm({
     *   msg: '确认删除？',
     *   yes: function() {
     *     console.log('用户点击了确定');
     *   },
     *   no: function() {
     *     console.log('用户点击了取消');
     *   }
     * });
     *
     * // 自定义配置
     * $.layer.confirm({
     *   msg: '确认操作？',
     *   yes: function() {
     *     // 确定回调
     *   },
     *   no: function() {
     *     // 取消回调
     *   },
     *   title: '系统确认',
     *   btnConfirm: '是',
     *   btnCancel: '否',
     *   className: 'custom-confirm',
     *   style: 'width: 450px;'
     * });
     */
    confirm(options = {}) {
      const { msg, yes, no, title = '确认', btnConfirm = '确定', btnCancel = '取消', ...rest } = options;
      return createDialog({
        title:   title,
        content: `<div>${msg}</div>`,
        buttons: [
          { text: btnCancel, onClick: no  },
          { text: btnConfirm, onClick: yes }
        ].slice(0, 2), // 确保最多只有两个按钮
        ...rest
      });
    },

    /**
     * 显示消息提示（自动关闭）
     * @param {LayerOptions} options - 配置选项
     * @param {string} options.message - 消息内容
     * @param {number} [options.time=2000] - 显示时间（毫秒）
     * @returns {number} 弹层实例ID
     * @example
     * // 基本用法
     * $.layer.msg({ message: '操作成功！' });
     *
     * // 自定义显示时间
     * $.layer.msg({ message: '保存成功！', time: 3000 });
     *
     * // 自定义配置
     * $.layer.msg({
     *   message: '自定义消息',
     *   time: 5000,
     *   className: 'custom-msg',
     *   style: 'background: #4CAF50; color: white;'
     * });
     */
    msg(options = {}) {
      const { message, time = 2000, ...rest } = options;
      const id = createDialog({
        content:    `<div>${message}</div>`,
        closeBtn:   false,
        ...rest
      });
      setTimeout(() => this.close(id), time);
      return id;
    },

    /**
     * 显示加载中弹层
     * @param {LayerOptions} [options={}] - 配置选项
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
     *   className: 'custom-loading',
     *   style: 'width: 300px;'
     * });
     */
    load(options = {}) {
      return createDialog({
        content:    '<mdui-spinner></mdui-spinner>',
        closeBtn:   false,
        ...options
      });
    },

    /**
     * 显示HTML内容弹层
     * @param {LayerOptions} options - 配置选项
     * @param {string} options.content - HTML内容
     * @param {string} [options.title=''] - 弹层标题
     * @returns {number} 弹层实例ID
     * @example
     * // 基本用法
     * $.layer.html({ content: '<div>自定义HTML内容</div>' });
     *
     * // 带标题
     * $.layer.html({
     *   content: '<div>复杂HTML内容</div>',
     *   title: '详细信息'
     * });
     *
     * // 自定义样式
     * $.layer.html({
     *   content: '<div>样式化内容</div>',
     *   title: '自定义样式',
     *   className: 'custom-html-layer',
     *   style: 'width: 600px; height: 400px;'
     * });
     */
    html(options = {}) {
      const { content, title = '', ...rest } = options;
      return createDialog({ title: title, content: content, ...rest });
    },

    /**
     * 显示iframe弹层
     * @param {LayerOptions} options - 配置选项
     * @param {string} options.src - iframe源地址
     * @param {string} [options.title=''] - 弹层标题
     * @returns {number} 弹层实例ID
     * @example
     * // 基本用法
     * $.layer.iframe({ src: '/api/detail' });
     *
     * // 带标题
     * $.layer.iframe({
     *   src: '/api/detail',
     *   title: '详细信息'
     * });
     *
     * // 外部链接
     * $.layer.iframe({
     *   src: 'https://example.com',
     *   title: '外部链接',
     *   style: 'width: 800px; height: 600px;'
     * });
     */
    iframe(options = {}) {
      const { src, title = '', ...rest } = options;
      return createDialog({
        title:   title,
        content: `<iframe src="${src}" style="width:100%;height:100%;border:0;" loading="lazy"></iframe>`,
        ...rest
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
      if(cache.get(id)){
        cache.get(id).open = false;
      }
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

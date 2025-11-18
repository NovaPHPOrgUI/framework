/**
 * 主题切换组件
 * 提供主题模式切换和颜色方案选择功能
 * @file ThemeSwitcher.js
 * @author License Auto System
 * @version 1.0.0
 */

/*
 * Copyright (c) 2025. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

/**
 * 主题切换组件类
 * 继承自HTMLElement，提供自定义主题切换元素
 */
class ThemeSwitcher extends HTMLElement {
    /**
     * 构造函数
     * 初始化Shadow DOM
     */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

    }

    /**
     * 组件连接到DOM时调用
     * 初始化组件结构和事件绑定
     */
    connectedCallback() {
        /** @type {boolean} 是否使用图标按钮模式 */
        const iconBtn = this.getAttribute('iconBtn') || false;
        this.shadowRoot.innerHTML = `
          <mdui-dropdown placement="auto">
          ${iconBtn ? '<mdui-button-icon slot="trigger"  icon="color_lens" id="iconBtn"></mdui-button-icon>' : '<mdui-fab slot="trigger" id="fabBtn" icon="color_lens" >    </mdui-fab>'}
            <mdui-card class="card" variant="elevated">
              <div class="color-label">页面样式</div>
              <div class="color-preset">
                <mdui-button-icon id="lightModeBtn" icon="light_mode--outlined"></mdui-button-icon>
                <mdui-button-icon id="darkModeBtn" icon="dark_mode--outlined"> </mdui-button-icon>
                <mdui-button-icon id="autoModeBtn" icon="hdr_auto--outlined"> </mdui-button-icon>
              </div>
              <div class="color-label">预设颜色</div>
              <div class="color-preset">
                <div class="red" data-color="#bb1614"></div>
                <div class="purple" data-color="#9a25ae"></div>
                <div class="blue" data-color="#0061a4"></div>
                <div class="green" data-color="#006e1c"></div>
                <div class="yellow" data-color="#695f00"></div>
                <div class="grey" data-color="#006874"></div>
              </div>
              <div class="color-label">自选颜色</div>
              <input type="color" class="color-custom" id="customColorInput">
            </mdui-card>
          </mdui-dropdown>
          <style>
          :host {
          display: flex;
        
          }

           .card {
            padding: 1rem;
           }
.color-label {
    cursor: default;
    color: rgb(var(--mdui-color-on-surface-variant));
    font-size: var(--mdui-typescale-title-small-size);
    font-weight: var(--mdui-typescale-title-small-weight);
    letter-spacing: var(--mdui-typescale-title-small-tracking);
    line-height: var(--mdui-typescale-title-small-line-height);
}

.color-label:not(:first-child) {
    margin-top: 0.5rem;
}

.color-preset {
    display: flex;
    padding: 0.5rem 0rem;
}

.color-preset div {
    cursor: pointer;
    box-sizing: border-box;
    width: 1.875rem;
    height: 1.875rem;
    border-radius: var(--mdui-shape-corner-extra-small);
    border: 0.0625rem solid rgb(var(--mdui-color-outline));
}

.color-preset div + div {
    margin-left: 0.5rem;
}

.color-preset .red {
    background-color: #bb1614;
}

.color-preset .purple {
    background-color: #9a25ae;
}

.color-preset .blue {
    background-color: #0061a4;
}

.color-preset .green {
    background-color: #006e1c;
}

.color-preset .yellow {
    background-color: #695f00;
}

.color-preset .grey {
    background-color: #006874;
}

.mdui-theme-dark .color-preset .red {
    background-color: #ffb4aa;
}

.mdui-theme-dark .color-preset .purple {
    background-color: #f9abff;
}

.mdui-theme-dark .color-preset .blue {
    background-color: #9ecaff;
}

.mdui-theme-dark .color-preset .green {
    background-color: #78dc77;
}

.mdui-theme-dark .color-preset .yellow {
    background-color: #dbc90a;
}

.mdui-theme-dark .color-preset .grey {
    background-color: #4fd8eb;
}

@media (prefers-color-scheme: dark) {
    .mdui-theme-auto .color-preset .red {
        background-color: #ffb4aa;
    }
    .mdui-theme-auto .color-preset .purple {
        background-color: #f9abff;
    }
    .mdui-theme-auto .color-preset .blue {
        background-color: #9ecaff;
    }
    .mdui-theme-auto .color-preset .green {
        background-color: #78dc77;
    }
    .mdui-theme-auto .color-preset .yellow {
        background-color: #dbc90a;
    }
    .mdui-theme-auto .color-preset .grey {
        background-color: #4fd8eb;
    }
}
.color-custom {
    cursor: pointer;
    box-sizing: border-box;
    width: 1.875rem;
    height: 1.875rem;
    border-radius: var(--mdui-shape-corner-extra-small);
    border: 0.0625rem solid rgb(var(--mdui-color-outline));
    margin: 0.5rem 0rem;
}


          </style>
        `;


        /** @type {string} 本地存储的主题模式 */
        this.localMode = localStorage.getItem('theme') || 'auto';
        this.changeMode(this.localMode);

        /** @type {string} 本地存储的主题颜色 */
        this.localColor = localStorage.getItem('color') || '#0061a4';
        this.setColor(this.localColor);

        this.shadowRoot.getElementById('lightModeBtn').addEventListener('click', () => this.changeMode('light'));
        this.shadowRoot.getElementById('darkModeBtn').addEventListener('click', () => this.changeMode('dark'));
        this.shadowRoot.getElementById('autoModeBtn').addEventListener('click', () => this.changeMode('auto'));

        const presetColors = this.shadowRoot.querySelectorAll('.color-preset div');
        presetColors.forEach(div => {
            div.addEventListener('click', (event) => this.setColor(event.target.getAttribute('data-color')));
        });

        this.shadowRoot.getElementById('customColorInput').addEventListener('change', (event) => this.customColor(event));

        let that = this;
        $.emitter.on('translate:set', () => {
            TranslateUtils &&  TranslateUtils.autoTranslate(this.shadowRoot);
        });
    }

    /**
     * 切换主题模式
     * @param {string} mode - 主题模式，可选值：'light', 'dark', 'auto'
     */
    changeMode(mode) {
        const html = document.documentElement;
        html.classList.remove('mdui-theme-dark', 'mdui-theme-light', 'mdui-theme-auto');
        html.classList.add(`mdui-theme-${mode}`);
        mdui.setTheme(mode);
        localStorage.setItem('theme', mode);
        this.localMode = mode;

        this.shadowRoot.getElementById('lightModeBtn').icon = mode === 'light'? 'light_mode' : 'light_mode--outlined';
        this.shadowRoot.getElementById('darkModeBtn').icon = mode === 'dark'? 'dark_mode' : 'dark_mode--outlined';
        this.shadowRoot.getElementById('autoModeBtn').icon = mode === 'auto'? 'hdr_auto' : 'hdr_auto--outlined';
        $.emitter.emit('theme', mode);
    }

    /**
     * 设置主题颜色
     * @param {string} color - 颜色值，支持十六进制颜色代码
     */
    setColor(color) {
        mdui.setColorScheme(color);
        localStorage.setItem('color', color);
        $.emitter.emit('color:set', color);
    }

    /**
     * 处理自定义颜色选择
     * @param {Event} event - 颜色选择事件
     */
    customColor(event) {
        this.setColor(event.target.value);
    }
}

/**
 * 注册自定义主题切换元素
 */
customElements.define('theme-switcher', ThemeSwitcher);

/**
 * 主题切换组件
 * 提供主题模式切换和颜色方案选择功能
 * @file ThemeSwitcher.js
 */

class ThemeSwitcher extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    init(){
        const iconBtn = this.getAttribute('iconBtn') || false;
        this.shadowRoot.innerHTML = `
          <mdui-dropdown placement="auto">
          ${iconBtn ? '<mdui-button-icon slot="trigger" icon="color_lens" id="iconBtn"></mdui-button-icon>' : '<mdui-fab slot="trigger" id="fabBtn" icon="color_lens"></mdui-fab>'}
            <mdui-card class="card" variant="elevated">
              <div class="color-label">页面样式</div>
              <div class="color-preset color-preset--mode">
                <mdui-button-icon id="lightModeBtn" icon="light_mode--outlined"></mdui-button-icon>
                <mdui-button-icon id="darkModeBtn" icon="dark_mode--outlined"></mdui-button-icon>
                <mdui-button-icon id="autoModeBtn" icon="hdr_auto--outlined"></mdui-button-icon>
              </div>
              <div class="color-label">预设颜色</div>
              <div class="color-preset color-preset--theme">
                ${renderMaterialPresetSwatches()}
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
            max-width: 16.5rem;
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
            padding: 0.5rem 0;
          }

          .color-preset--mode mdui-button-icon + mdui-button-icon {
            margin-left: 0.5rem;
          }

          .color-preset--theme {
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .color-swatch {
            cursor: pointer;
            box-sizing: border-box;
            width: 1.875rem;
            height: 1.875rem;
            border-radius: var(--mdui-shape-corner-extra-small);
            border: 0.0625rem solid rgba(var(--mdui-color-outline), 0.55);
          }

          .color-swatch.is-active {
            outline: 2px solid rgb(var(--mdui-color-primary));
            outline-offset: 2px;
          }

          .color-custom {
            cursor: pointer;
            box-sizing: border-box;
            width: 1.875rem;
            height: 1.875rem;
            border-radius: var(--mdui-shape-corner-extra-small);
            border: 0.0625rem solid rgb(var(--mdui-color-outline));
            margin: 0.5rem 0;
          }
          </style>
        `;

        this.localMode = localStorage.getItem('theme') || 'auto';
        this.changeMode(this.localMode);

        this.localColor = localStorage.getItem('color') || MATERIAL_DEFAULT_COLOR;
        this.setColor(this.localColor);

        this.shadowRoot.getElementById('lightModeBtn').addEventListener('click', () => this.changeMode('light'));
        this.shadowRoot.getElementById('darkModeBtn').addEventListener('click', () => this.changeMode('dark'));
        this.shadowRoot.getElementById('autoModeBtn').addEventListener('click', () => this.changeMode('auto'));

        this.shadowRoot.querySelectorAll('.color-swatch').forEach((swatch) => {
            swatch.addEventListener('click', () => this.setColor(swatch.getAttribute('data-color')));
        });

        this.shadowRoot.getElementById('customColorInput').addEventListener('change', (event) => this.customColor(event));

        $.emitter.on('translate:set', () => {
            TranslateUtils && TranslateUtils.autoTranslate(this.shadowRoot);
        });
    }

    connectedCallback() {

        let that = this;
        $.loader('framework/theme/materialColors.js',function () {
            that.init();
        })

    }

    syncActiveSwatch(color) {
        const normalized = (color || '').toLowerCase();
        this.shadowRoot.querySelectorAll('.color-swatch').forEach((swatch) => {
            const swatchColor = (swatch.getAttribute('data-color') || '').toLowerCase();
            swatch.classList.toggle('is-active', swatchColor === normalized);
        });
    }

    changeMode(mode) {
        const html = document.documentElement;
        html.classList.remove('mdui-theme-dark', 'mdui-theme-light', 'mdui-theme-auto');
        html.classList.add(`mdui-theme-${mode}`);
        mdui.setTheme(mode);
        localStorage.setItem('theme', mode);
        this.localMode = mode;

        this.shadowRoot.getElementById('lightModeBtn').icon = mode === 'light' ? 'light_mode' : 'light_mode--outlined';
        this.shadowRoot.getElementById('darkModeBtn').icon = mode === 'dark' ? 'dark_mode' : 'dark_mode--outlined';
        this.shadowRoot.getElementById('autoModeBtn').icon = mode === 'auto' ? 'hdr_auto' : 'hdr_auto--outlined';
        $.emitter.emit('theme', mode);
    }

    setColor(color) {
        mdui.setColorScheme(color);
        localStorage.setItem('color', color);
        this.localColor = color;
        this.syncActiveSwatch(color);
        const customInput = this.shadowRoot.getElementById('customColorInput');
        if (customInput && /^#[0-9a-f]{6}$/i.test(color)) {
            customInput.value = color;
        }
        $.emitter.emit('color:set', color);
    }

    customColor(event) {
        this.setColor(event.target.value);
    }
}

customElements.define('theme-switcher', ThemeSwitcher);

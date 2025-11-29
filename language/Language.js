/**
 * 语言切换组件
 * 提供多语言切换功能，支持多种语言和国旗图标显示
 * @file Language.js
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
 * 语言切换组件类
 * 继承自HTMLElement，提供自定义语言切换元素
 */
class Language extends HTMLElement {
  /**
   * 构造函数
   * 初始化Shadow DOM
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

  }
  
  /**
   * 组件连接到DOM时调用
   * 初始化组件结构和事件绑定
   */
  connectedCallback() {
      /** @type {boolean} 是否使用图标按钮模式 */
      const iconBtn = this.getAttribute("iconBtn") || false;
      this.shadowRoot.innerHTML = `
        <mdui-dropdown placement="auto">
${iconBtn ? '<mdui-button-icon slot="trigger"  icon="translate" id="iconBtn"></mdui-button-icon>' : '<mdui-fab slot="trigger" id="fabBtn" icon="language" >    </mdui-fab>'}

    <mdui-menu selects="single" >
    </mdui-menu>
  </mdui-dropdown>
  <style>
          :host,mdui-menu-item {
          display: flex;
           
          }
          mdui-menu-item{
            align-items: center;
            cursor: pointer;
          }
           mdui-menu-item svg,mdui-menu-item span{
           height: 1rem;
           vertical-align: middle;
           }
           mdui-menu-item span{
           margin-left: 0.5rem;
           }
  </style>
  
        `;
      this.init();
  }
  
  /**
   * 初始化语言切换组件
   * 创建支持的语言列表和事件绑定
   */
  init() {
    let menu = this.shadowRoot.querySelector("mdui-menu");

    /** @type {Array<Object>} 支持的语言列表 */
    let supportLang = [
      {
        id: "chinese_simplified",
        name: "简体中文",
        serviceId: "zh-CHS",
        svg: `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="flag-icons-cn" viewBox="0 0 640 480">
  <defs>
    <path id="cn-a" fill="#ff0" d="M-.6.8 0-1 .6.8-1-.3h2z"/>
  </defs>
  <path fill="#ee1c25" d="M0 0h640v480H0z"/>
  <use xlink:href="#cn-a" width="30" height="20" transform="matrix(71.9991 0 0 72 120 120)"/>
  <use xlink:href="#cn-a" width="30" height="20" transform="matrix(-12.33562 -20.5871 20.58684 -12.33577 240.3 48)"/>
  <use xlink:href="#cn-a" width="30" height="20" transform="matrix(-3.38573 -23.75998 23.75968 -3.38578 288 95.8)"/>
  <use xlink:href="#cn-a" width="30" height="20" transform="matrix(6.5991 -23.0749 23.0746 6.59919 288 168)"/>
  <use xlink:href="#cn-a" width="30" height="20" transform="matrix(14.9991 -18.73557 18.73533 14.99929 240 216)"/>
</svg>`,
      },
      {
        id: "chinese_traditional",
        name: "繁體中文",
        serviceId: "zh-CHT",
        svg: `
<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-tw" viewBox="0 0 640 480">
  <clipPath id="tw-a">
    <path d="M0 0h640v480H0z"/>
  </clipPath>
  <g clip-path="url(#tw-a)">
    <path fill="red" d="M0 0h720v480H0z"/>
    <path fill="#000095" d="M0 0h360v240H0z"/>
    <g fill="#fff">
      <path d="m154 126.9-2.5 9.6 9.4 2.6-1.8-7.1zm46.9 5.1-1.8 7.1 9.4-2.6-2.5-9.6zm-41.8-24-5.1 5.1 1.9 6.9z"/>
      <path d="m155.9 120-1.9 6.9 5.1 5.1z"/>
      <path d="m154 113.1-6.9 6.9 6.9 6.9 1.9-6.9zm14 27.8 5.1 5.1 6.9-1.9zm18.9 5.1 9.6 2.5 2.6-9.4-7.1 1.8z"/>
      <path d="m192 140.9 7.1-1.8 1.8-7.1zm-31.1-1.8 2.6 9.4 9.6-2.5-5.1-5.1zm19.1 5 6.9 1.9 5.1-5.1z"/>
      <path d="m173.1 146 6.9 6.9 6.9-6.9-6.9-1.9zm-12.2-45.1-9.4 2.6 2.5 9.6 5.1-5.1zm-1.8 31.1 1.8 7.1 7.1 1.8zm45-12 1.9-6.9-5.1-5.1z"/>
      <path d="m168 99.1-7.1 1.8-1.8 7.1zm32.9 8.9-1.8-7.1-7.1-1.8zm5.1 18.9 6.9-6.9-6.9-6.9-1.9 6.9z"/>
      <path d="m200.9 108-8.9-8.9-12-3.2-12 3.2-8.9 8.9-3.2 12 3.2 12 8.9 8.9 12 3.2 12-3.2 8.9-8.9 3.2-12z"/>
      <path d="m200.9 132 5.1-5.1-1.9-6.9zm5.1-18.9 2.5-9.6-9.4-2.6 1.8 7.1zm-6.9-12.2-2.6-9.4-9.6 2.5 5.1 5.1zm-26-6.9-9.6-2.5-2.6 9.4 7.1-1.8zm6.9 1.9-6.9-1.9-5.1 5.1z"/>
      <path d="m186.9 94-6.9-6.9-6.9 6.9 6.9 1.9z"/>
      <path d="m192 99.1-5.1-5.1-6.9 1.9zM173.1 146l-9.6 2.5 4.5 16.6 12-12.2zm-5.1 19.1 12 44.9 12-44.9-12-12.2zm-7.1-26-9.4-2.6-4.4 16.4 16.4-4.4z"/>
      <path d="m147.1 152.9-12 45.1 32.9-32.9-4.5-16.6zm-12-20.9L102 165.1l45.1-12.2 4.4-16.4z"/>
      <path d="m154 126.9-6.9-6.9-12 12 16.4 4.5zm0-13.8-2.5-9.6-16.4 4.5 12 12z"/>
      <path d="M135.1 108 90 120l45.1 12 12-12zm90 24-16.6 4.5 4.4 16.4 45.1 12.2z"/>
      <path d="m199.1 139.1-2.6 9.4 16.4 4.4-4.4-16.4zm-12.2 6.9-6.9 6.9 12 12.2 4.5-16.6zm19.1-19.1 2.5 9.6 16.6-4.5-12.2-12z"/>
      <path d="m192 165.1 33.1 32.9-12.2-45.1-16.4-4.4zm7.1-64.2 9.4 2.6 4.4-16.4-16.4 4.4z"/>
      <path d="M225.1 108 258 75.1l-45.1 12-4.4 16.4zm-12.2-20.9L225.1 42 192 75.1l4.5 16.4zm12.2 44.9 44.9-12-44.9-12-12.2 12z"/>
      <path d="m206 113.1 6.9 6.9 12.2-12-16.6-4.5zm-38-38L135.1 42l12 45.1 16.4 4.4z"/>
      <path d="m160.9 100.9 2.6-9.4-16.4-4.4 4.4 16.4z"/>
      <path d="m147.1 87.1-45.1-12 33.1 32.9 16.4-4.5zm39.8 6.9 9.6-2.5-4.5-16.4-12 12z"/>
      <path d="M192 75.1 180 30l-12 45.1 12 12z"/>
      <path d="m173.1 94 6.9-6.9-12-12-4.5 16.4z"/>
    </g>
    <circle cx="180" cy="120" r="51.1" fill="#000095"/>
    <circle cx="180" cy="120" r="45.1" fill="#fff"/>
  </g>
</svg>
`,
      },
      {
        id: "english",
        name: "English",
        serviceId: "en",
        svg: `
<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-gb" viewBox="0 0 640 480">
  <path fill="#012169" d="M0 0h640v480H0z"/>
  <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0z"/>
  <path fill="#C8102E" d="m424 281 216 159v40L369 281zm-184 20 6 35L54 480H0zM640 0v3L391 191l2-44L590 0zM0 0l239 176h-60L0 42z"/>
  <path fill="#FFF" d="M241 0v480h160V0zM0 160v160h640V160z"/>
  <path fill="#C8102E" d="M0 193v96h640v-96zM273 0v480h96V0z"/>
</svg>
`,
      },
      {
        id: "japanese",
        name: "しろうと",
        serviceId: "ja",
        svg: `
<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-jp" viewBox="0 0 640 480">
  <defs>
    <clipPath id="jp-a">
      <path fill-opacity=".7" d="M-88 32h640v480H-88z"/>
    </clipPath>
  </defs>
  <g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#jp-a)" transform="translate(88 -32)">
    <path fill="#fff" d="M-128 32h720v480h-720z"/>
    <circle cx="523.1" cy="344.1" r="194.9" fill="#bc002d" transform="translate(-168.4 8.6)scale(.76554)"/>
  </g>
</svg>
`,
      },
      {
        id: "korean",
        name: "한국어",
        serviceId: "ko",
        svg: `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="flag-icons-kr" viewBox="0 0 640 480">
  <defs>
    <clipPath id="kr-a">
      <path fill-opacity=".7" d="M-95.8-.4h682.7v512H-95.8z"/>
    </clipPath>
  </defs>
  <g fill-rule="evenodd" clip-path="url(#kr-a)" transform="translate(89.8 .4)scale(.9375)">
    <path fill="#fff" d="M-95.8-.4H587v512H-95.8Z"/>
    <g transform="rotate(-56.3 361.6 -101.3)scale(10.66667)">
      <g id="kr-c">
        <path id="kr-b" fill="#000001" d="M-6-26H6v2H-6Zm0 3H6v2H-6Zm0 3H6v2H-6Z"/>
        <use xlink:href="#kr-b" width="100%" height="100%" y="44"/>
      </g>
      <path stroke="#fff" d="M0 17v10"/>
      <path fill="#cd2e3a" d="M0-12a12 12 0 0 1 0 24Z"/>
      <path fill="#0047a0" d="M0-12a12 12 0 0 0 0 24A6 6 0 0 0 0 0Z"/>
      <circle cy="-6" r="6" fill="#cd2e3a"/>
    </g>
    <g transform="rotate(-123.7 191.2 62.2)scale(10.66667)">
      <use xlink:href="#kr-c" width="100%" height="100%"/>
      <path stroke="#fff" d="M0-23.5v3M0 17v3.5m0 3v3"/>
    </g>
  </g>
</svg>
`,
      },
      {
        id: "russian",
        name: "Русский язык",
        serviceId: "ru",
        svg: `
<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ru" viewBox="0 0 640 480">
  <path fill="#fff" d="M0 0h640v160H0z"/>
  <path fill="#0039a6" d="M0 160h640v160H0z"/>
  <path fill="#d52b1e" d="M0 320h640v160H0z"/>
</svg>
`,
      },
      {
        id: "french",
        name: "Français",
        serviceId: "fr",
        svg: `
<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-gf" viewBox="0 0 640 480">
  <path fill="#fff" d="M0 0h640v480H0z"/>
  <path fill="#000091" d="M0 0h213.3v480H0z"/>
  <path fill="#e1000f" d="M426.7 0H640v480H426.7z"/>
</svg>
`,
      },
    ];
    let that = this;
    for (let lang of supportLang) {
      let item = document.createElement("mdui-menu-item");
      item.setAttribute("value", lang.id);
      item.setAttribute("serviceId", lang.serviceId);
      item.innerHTML = `${lang.svg} <span>${lang.name}</span>`;
      item.addEventListener("click", () => {
        that.setLanguage(lang.id);
      });
      menu.appendChild(item);
    }

    menu.value = this.getLanguage();

      TranslateUtils.init( this.getSiteLanguage(), true);

    $.emitter.on("translate:start", () => {
        TranslateUtils.autoTranslate();
      that.translate();
    });
  }

  /**
   * 获取网站默认语言
   * @returns {string} 语言标识符
   */
  getSiteLanguage(){
      const htmlLang = document.documentElement.lang || 'zh-CN';
      const langMap = {
          'zh-CN': 'chinese_simplified',
          'zh-TW': 'chinese_traditional',
          'en': 'english',
          'ja': 'japanese',
          'ko': 'korean',
          'ru': 'russian',
          'fr': 'french'
      };

      return langMap[htmlLang] || 'chinese_simplified';
  }

  /**
   * 获取当前语言设置
   * @returns {string} 当前语言标识符
   */
  getLanguage() {
    // 首先检查本地存储
    const storedLang = localStorage.getItem("language");
    if (storedLang) return storedLang;
    return this.getSiteLanguage() || 'chinese_simplified';
  }

  /**
   * 执行翻译操作
   */
  translate() {
    $.emitter.emit("translate:set");
    //翻译label
  }

  /**
   * 设置语言
   * @param {string} lang - 语言标识符
   */
  setLanguage(lang) {
      TranslateUtils.change(lang);
    this.translate();
  }
}

/**
 * 注册自定义语言切换元素
 */
customElements.define("lang-switcher", Language);

/**
 * 全局翻译函数
 * @param {string} text - 要翻译的文本
 * @param {Function} callback - 翻译完成后的回调函数
 */
$.translate = (text, callback) => {
    TranslateUtils.translateText(text, callback)
};

/**
 * Material 主题色板（与 base.scss $material-source 保持一致）
 */
const MATERIAL_COLORS = {
    default_color: '#6750A4',
    sakura: '#FF9CA8',
    red: '#F44336',
    pink: '#E91E63',
    purple: '#9C27B0',
    'deep-purple': '#673AB7',
    indigo: '#3F51B5',
    blue: '#2196F3',
    'light-blue': '#03A9F4',
    cyan: '#00BCD4',
    teal: '#009688',
    green: '#4CAF50',
    'light-green': '#8BC34A',
    lime: '#CDDC39',
    yellow: '#FFEB3B',
    amber: '#FFC107',
    orange: '#FF9800',
    'deep-orange': '#FF5722',
    brown: '#795548',
    'blue-grey': '#607D8B',
};

const MATERIAL_COLOR_ORDER = [
    'default_color',
    'sakura',
    'red',
    'pink',
    'purple',
    'deep-purple',
    'indigo',
    'blue',
    'light-blue',
    'cyan',
    'teal',
    'green',
    'light-green',
    'lime',
    'yellow',
    'amber',
    'orange',
    'deep-orange',
    'brown',
    'blue-grey',
];

const MATERIAL_DEFAULT_COLOR = MATERIAL_COLORS.default_color;

function renderMaterialPresetSwatches() {
    return MATERIAL_COLOR_ORDER.map((key) => {
        const hex = MATERIAL_COLORS[key];
        return `<div class="color-swatch" data-material="${key}" data-color="${hex}" title="${key}" style="background-color: rgb(var(--material-${key}))"></div>`;
    }).join('');
}

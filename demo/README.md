# Nova UI Demo

本目录是 **开发期视觉参考**，不参与线上业务。

## 打包过滤

路径约定：`static/framework/demo/`（或任意 `**/framework/demo/**`）。

- Docker：根目录 `.dockerignore` 排除
- 单容器镜像：`Dockerfile.workerman` 构建后删除
- Release zip：CI 在 `nova.phar build` 后剔除该目录

本地打开：用浏览器直接打开各 HTML（无需后端）。

## 风格清单

| 文件 | 用途 |
| --- | --- |
| `index.html` | 目录页 |
| `admin-m3.html` | 后台 · Material You 抽屉壳 |
| `front-m3.html` | 前台 · Material You 顶栏导航 |
| `admin-dense.html` | 后台 · 高密度管理台 |
| `library-paper.html` | 产品壳 · 私人图书馆（封面优先） |
| `motion.html` | 动效样例（对接 `motion.css`） |

正式业务请用 `layout.tpl`（后台）/ `layout2.tpl`（前台）+ MDUI，不要直接依赖 demo 里的内联样式。

# 部署方案(外网可访问)

## 当前方案:GitHub Pages(已上线)

- 站点地址:**https://beishengi.github.io/Blog/**
- 部署分支:`gh-pages`(由 `dist/` 构建产物构成的孤儿分支)
- 文章 RSS / canonical 已指向该地址(`src/config/default.config.ts` 的 `site.url`)

### 重新部署

```bash
npm run deploy:pages
```

一条命令完成:构建(base=/Blog/)→ `dist/index.html` 复制为 `404.html`(SPA 深链回退)→ 写入 `.nojekyll` → 将 `dist/` 以孤儿仓库强推 `gh-pages` 分支 → 通过 GitHub API 确认 Pages 指向正确。GitHub 端构建约 1 分钟后生效,可查状态:

```bash
curl -s -H "Authorization: Bearer <token>" \
  https://api.github.com/repos/beishengI/Blog/pages/builds/latest
```

### 实现要点

| 项 | 说明 |
| --- | --- |
| 资源前缀 | `vite build --base=/Blog/`(`npm run build:pages`),不影响本地 dev |
| SPA 路由 | `BrowserRouter basename={import.meta.env.BASE_URL}`(`src/main.tsx`),深链由 404.html 回退后客户端接管 |
| 凭据 | Windows 凭据管理器已存 github.com HTTPS 令牌(`git credential fill` 自动获取,脚本不回显) |
| 代理 | 本机 git 全局代理 127.0.0.1:7890 未常开,部署脚本统一 `-c http.proxy=` 绕过直连 |
| 推送源码 | `git push https://github.com/beishengI/Blog.git main`(SSH key 受阻,走 HTTPS 凭据) |

## 方案对比与取舍

| 方案 | 大陆访问 | 自动化 | 结论 |
| --- | --- | --- | --- |
| **GitHub Pages(现用)** | github.io 时好时坏 | ✅ 全自动(本机凭据现成) | 已上线;外网访问稳定 |
| Vercel / Netlify | *.vercel.app 大陆被墙,需自定义域 | 需注册账号/令牌 | 备选,需用户提供令牌 |
| Cloudflare Pages | pages.dev 尚可但不稳 | 需 API 令牌 | 备选 |
| EdgeOne Pages(腾讯) | 国内 CDN,最快 | 需腾讯云账号令牌 | 需要稳定国内访问时的首选,提供令牌即可接入 |
| HPC 服务器(hpc-zdd) | 公网 IP 可达 | — | **不采用**:CentOS 7 集群 master 节点,无 sudo、无 nginx,docker 组未授权;登录节点挂个人站有策略与清理风险 |
| 家用机 + 内网穿透 | 依赖穿透稳定性 | 需常开主机 | 不推荐 |

### 若需稳定的大陆访问

推荐追加 **EdgeOne Pages**(腾讯云免费静态托管,支持从 GitHub 仓库自动构建,国内 CDN)。提供 EdgeOne API 令牌后,可把仓库接入其构建流水线,与现有 gh-pages 流程并行,双站同源。

## 已知限制

- 文章数据在 `src/data/posts.ts`(构建期进产物),管理台新建的 localStorage 文章不进线上站,也不进 RSS——如需线上发文流程,见 `docs/SDD.md` 的 Git 内容工作流规划。
- 自定义域名/HTTPS 证书:GitHub Pages 默认提供 `*.github.io` 的 HTTPS;若绑定自有域名,在仓库 Settings → Pages 配置并在 DNS 加 CNAME。

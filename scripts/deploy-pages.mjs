/**
 * GitHub Pages 部署脚本(scripts/deploy-pages.mjs)
 *
 * 流程:dist/index.html → 404.html(SPA 回退)→ 以 dist 为孤儿仓库强推 gh-pages 分支
 *      → 通过 GitHub API 确保 Pages 已指向 gh-pages 分支。
 *
 * 前置条件:
 *  - Windows 凭据管理器已存 github.com 的 HTTPS 凭据(git credential fill 可取到)
 *  - 本机 git 全局代理(127.0.0.1:7890)可能未开,脚本内统一以 -c http.proxy= 绕过
 *
 * 用法:npm run deploy:pages(内部先 build:pages 再调本脚本)
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const REPO_HTTPS = 'https://github.com/beishengI/Blog.git';
const OWNER_REPO = 'beishengI/Blog';
const BRANCH = 'gh-pages';

/** 绕过全局代理执行 git 命令(输出不回显令牌)。 */
function git(args, opts = {}) {
  return execFileSync('git', ['-c', 'http.proxy=', '-c', 'https.proxy=', ...args], {
    cwd: opts.cwd ?? ROOT,
    stdio: opts.stdio ?? ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
}

/** 从凭据管理器取 github.com 令牌(仅内存使用,不打印)。 */
function githubToken() {
  const r = spawnSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n',
    encoding: 'utf8',
  });
  const m = r.stdout.match(/^password=(.+)$/m);
  if (!m) throw new Error('凭据管理器中没有 github.com 的令牌,请先手动推送一次或 gh auth login');
  return m[1];
}

/** 调 GitHub REST API。 */
function ghApi(token, method, path, body) {
  const r = spawnSync(
    'curl',
    [
      '-s', '-o', '-', '-w', '\n%{http_code}',
      '-X', method,
      '-H', `Authorization: Bearer ${token}`,
      '-H', 'Accept: application/vnd.github+json',
      ...(body ? ['-d', JSON.stringify(body)] : []),
      `https://api.github.com/repos/${OWNER_REPO}/${path}`,
    ],
    { encoding: 'utf8' }
  );
  const out = r.stdout ?? '';
  const idx = out.lastIndexOf('\n');
  return { status: Number(out.slice(idx + 1).trim()), body: out.slice(0, idx) };
}

function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) {
    throw new Error('dist/index.html 不存在,请先 npm run build:pages');
  }
  // SPA 回退:GitHub Pages 对未知路径返回 404.html
  copyFileSync(path.join(DIST, 'index.html'), path.join(DIST, '404.html'));
  writeFileSync(path.join(DIST, '.nojekyll'), '');

  // dist 作为独立孤儿仓库强推 gh-pages
  git(['init'], { cwd: DIST });
  try { git(['checkout', '-B', BRANCH], { cwd: DIST }); } catch { /* 首次 init 默认分支即可 */ }
  git(['add', '-A'], { cwd: DIST });
  git(['commit', '-m', `deploy: ${new Date().toISOString()}`, '--allow-empty'], { cwd: DIST });
  try { git(['remote', 'add', 'origin', REPO_HTTPS], { cwd: DIST }); } catch { /* 已存在 */ }
  git(['push', '-f', 'origin', `HEAD:${BRANCH}`], { cwd: DIST });
  console.log(`[deploy] 已推送 dist → ${BRANCH} 分支`);

  // 确保 Pages 已开启并指向 gh-pages
  const token = githubToken();
  const check = ghApi(token, 'GET', 'pages');
  if (check.status === 404) {
    const create = ghApi(token, 'POST', 'pages', {
      source: { branch: BRANCH, path: '/' },
    });
    if (create.status !== 201 && create.status !== 409) {
      throw new Error(`开启 Pages 失败: HTTP ${create.status} ${create.body.slice(0, 200)}`);
    }
    console.log('[deploy] 已通过 API 开启 GitHub Pages(gh-pages 分支)');
  } else {
    console.log(`[deploy] Pages 已存在(HTTP ${check.status}),跳过创建`);
  }

  const url = `https://beishengi.github.io/Blog/`;
  console.log(`[deploy] 部署完成,首次构建需 1-2 分钟:${url}`);
}

try {
  main();
} catch (err) {
  console.error('[deploy] 失败:', err.message);
  process.exit(1);
}

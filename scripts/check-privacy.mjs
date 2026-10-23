/**
 * Privacy gate for the public build.
 *
 * - Full phone number is never committed; pass it via PRIVATE_PHONE for the scan.
 * - Client denylist is local-only: privacy-denylist.local.txt (gitignored), one term per line.
 * - Scans source, public assets and the production build for text leaks.
 * - PDF text is checked separately by scripts/print-resume.cjs / PyMuPDF during QA.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.html', '.svg', '.xml', '.txt', '.css']);
const TARGETS = ['src', 'public', 'dist'];
const IGNORE_DIR = new Set(['node_modules', '.git', '.verify', 'docs', 'video']);

const terms = [];
const phone = (process.env.PRIVATE_PHONE || '').trim();
if (phone) terms.push({ label: 'PRIVATE_PHONE', value: phone });

const denylistPath = join(ROOT, 'privacy-denylist.local.txt');
if (existsSync(denylistPath)) {
  for (const line of readFileSync(denylistPath, 'utf8').split(/\r?\n/)) {
    const value = line.trim();
    if (value && !value.startsWith('#')) terms.push({ label: 'LOCAL_DENYLIST', value });
  }
}

if (terms.length === 0) {
  console.warn('[privacy] no PRIVATE_PHONE / privacy-denylist.local.txt terms configured; running structural checks only.');
}

const findings = [];

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (IGNORE_DIR.has(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (TEXT_EXT.has(extname(name).toLowerCase()) && stat.size < 8 * 1024 * 1024) {
      scan(path);
    }
  }
}

function scan(path) {
  const rel = relative(ROOT, path).replace(/\\/g, '/');
  const text = readFileSync(path, 'utf8');
  for (const term of terms) {
    if (text.includes(term.value)) {
      findings.push({ file: rel, term: term.label });
    }
  }
  if (/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) {
    findings.push({ file: rel, term: 'PRIVATE_KEY' });
  }
  if (/(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i.test(text)) {
    findings.push({ file: rel, term: 'POSSIBLE_SECRET' });
  }
}

for (const target of TARGETS) walk(join(ROOT, target));

if (findings.length) {
  console.error('[privacy] FAILED');
  for (const finding of findings) console.error(`  ${finding.file} :: ${finding.term}`);
  process.exitCode = 1;
} else {
  console.log(`[privacy] OK · scanned ${TARGETS.join(', ')} · ${terms.length} configured term(s)`);
}

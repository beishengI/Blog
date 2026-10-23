/**
 * Content gate: every published project must have an evidence / role / source shape,
 * every metric must declare a source or be marked pending, and cross-links must resolve.
 */
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const failures = [];

async function loadTs(entry) {
  const result = await build({
    entryPoints: [join(ROOT, entry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    logLevel: 'silent',
  });
  const code = result.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const { works } = await loadTs('src/data/works.ts');
const { resumeProjects } = await loadTs('src/data/resume.ts');
const wikiSource = readFileSync(join(ROOT, 'src/content/wiki/index.ts'), 'utf8');
const postsSource = readFileSync(join(ROOT, 'src/data/posts.ts'), 'utf8');
const wikiSlugs = new Set([...wikiSource.matchAll(/slug:\s*'([^']+)'/g)].map(match => match[1]));
const postIds = new Set([...postsSource.matchAll(/id:\s*'([^']+)'/g)].map(match => match[1]));

const slugs = new Set();
const projects = works.filter(work => work.kind === 'project');

if (projects.length !== 7) failures.push(`expected 7 project works, got ${projects.length}`);

for (const work of works) {
  const prefix = `work ${work.slug || '(no slug)'}`;
  if (!work.slug || !work.title || !work.role || !work.tagline) failures.push(`${prefix}: missing slug/title/role/tagline`);
  if (slugs.has(work.slug)) failures.push(`${prefix}: duplicate slug`);
  slugs.add(work.slug);
  if (!Array.isArray(work.stack) || work.stack.length === 0) failures.push(`${prefix}: empty stack`);
  if (!Array.isArray(work.metrics) || work.metrics.length === 0) failures.push(`${prefix}: empty metrics`);
  if (!Array.isArray(work.evidence) || work.evidence.length === 0) failures.push(`${prefix}: empty evidence`);
  if (!Array.isArray(work.decisions) || work.decisions.length === 0) failures.push(`${prefix}: empty decisions`);
  if (!Array.isArray(work.sourceRefs) || work.sourceRefs.length === 0) failures.push(`${prefix}: empty sourceRefs`);
  if (!['public', 'redacted', 'diagram-only'].includes(work.privacy)) failures.push(`${prefix}: invalid privacy`);
  for (const metric of work.metrics) {
    if (!metric.source && !metric.pending) failures.push(`${prefix}: metric "${metric.label}" has no source and is not pending`);
  }
  for (const slug of work.relatedWiki) {
    if (!wikiSlugs.has(slug)) failures.push(`${prefix}: relatedWiki "${slug}" not found`);
  }
  for (const id of work.relatedPosts) {
    if (!postIds.has(id)) failures.push(`${prefix}: relatedPost "${id}" not found`);
  }
}

for (const project of resumeProjects) {
  if (!project.name || !project.tag || !project.period) failures.push('resume project missing name/tag/period');
  if (!Array.isArray(project.points) || project.points.length === 0) failures.push(`resume project "${project.name}" has no points`);
  if (project.slug && !slugs.has(project.slug)) failures.push(`resume project "${project.name}" references missing work ${project.slug}`);
}

const allText = JSON.stringify(works) + JSON.stringify(resumeProjects);
for (const forbidden of ['GPA', '3.77', '专业第', '89.75']) {
  if (allText.includes(forbidden)) failures.push(`content still contains forbidden academic field: ${forbidden}`);
}

if (failures.length) {
  console.error('[content] FAILED');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`[content] OK · ${works.length} works (${projects.length} projects) · ${resumeProjects.length} resume projects · ${wikiSlugs.size} wiki slugs`);
}

import { useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';

/**
 * useSEO：SPA 客户端 SEO 注入钩子（纯 DOM upsert，无第三方依赖）。
 *
 * - 所有 meta/link/script 元素带 data-seo 标记定位，SPA 导航不会产生重复标签；
 *   首次 upsert 时会「收编」index.html 里的静态同名 meta（补打标记），避免双写。
 * - 全部操作幂等：存在则更新 content，缺失则创建，需移除时移除。
 * - options.title 非空 → `${title} · ${site.title}`；否则 → site.title。
 * - description 缺省回退 site.bio；keywords 为空时移除 meta；noindex=false 时移除
 *   robots meta；image 为空时移除 og:image、twitter:card 降级为 summary；
 *   site.url 为空时移除 canonical；jsonLd 为 null/undefined 时移除 JSON-LD script。
 */
export interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | null;
}

/** 固定标记属性：用于在 head 中唯一定位本钩子管理的元素 */
const MARK = 'data-seo';

/** 按标记查找 meta；找不到时尝试收编既有静态 meta（按 name/property 选择器） */
function findMeta(mark: string, key: string): HTMLMetaElement | null {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${MARK}="${mark}"]`);
  if (!el) {
    el =
      document.head.querySelector<HTMLMetaElement>(`meta[name="${key}"]`) ??
      document.head.querySelector<HTMLMetaElement>(`meta[property="${key}"]`);
    if (el) el.setAttribute(MARK, mark);
  }
  return el;
}

/** 存在则更新 content，不存在则创建并 append 到 head */
function upsertMeta(mark: string, attr: 'name' | 'property', key: string, content: string): void {
  let el = findMeta(mark, key);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(MARK, mark);
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** 移除带标记的 meta（含被收编的静态 meta） */
function removeMeta(mark: string): void {
  document.head.querySelector(`meta[${MARK}="${mark}"]`)?.remove();
}

export function useSEO(options: SEOOptions): void {
  const { config } = useConfig();
  const {
    title,
    description,
    keywords,
    image,
    type = 'website',
    noindex = false,
    jsonLd,
  } = options;
  const site = config.site;

  const fullTitle = title ? `${title} · ${site.title}` : site.title;
  const finalDescription = description || site.bio;
  const keywordsText = keywords?.join(',') ?? '';
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : '';
  const siteTitle = site.title;
  const siteUrl = site.url ?? '';

  useEffect(() => {
    // 1. 文档标题
    document.title = fullTitle;

    // 2. description / keywords / robots
    upsertMeta('description', 'name', 'description', finalDescription);
    if (keywordsText) upsertMeta('keywords', 'name', 'keywords', keywordsText);
    else removeMeta('keywords');
    if (noindex) upsertMeta('robots', 'name', 'robots', 'noindex, nofollow');
    else removeMeta('robots');

    // 3. Open Graph
    upsertMeta('og:title', 'property', 'og:title', fullTitle);
    upsertMeta('og:description', 'property', 'og:description', finalDescription);
    upsertMeta('og:type', 'property', 'og:type', type);
    upsertMeta('og:site_name', 'property', 'og:site_name', siteTitle);
    if (image) upsertMeta('og:image', 'property', 'og:image', image);
    else removeMeta('og:image');

    // 4. Twitter Card
    upsertMeta('twitter:card', 'name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    upsertMeta('twitter:title', 'name', 'twitter:title', fullTitle);
    upsertMeta('twitter:description', 'name', 'twitter:description', finalDescription);

    // 5. canonical：仅 site.url 非空时写，否则移除避免陈旧值
    if (siteUrl) {
      const href = `${siteUrl.replace(/\/+$/, '')}${window.location.pathname}`;
      let link = document.head.querySelector<HTMLLinkElement>(`link[${MARK}="canonical"]`);
      if (!link) {
        link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (link) link.setAttribute(MARK, 'canonical');
      }
      if (!link) {
        link = document.createElement('link');
        link.setAttribute(MARK, 'canonical');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    } else {
      document.head.querySelector(`link[${MARK}="canonical"]`)?.remove();
    }

    // 6. JSON-LD：非空 upsert，空则移除
    if (jsonLdText) {
      let script = document.head.querySelector<HTMLScriptElement>('script#seo-jsonld');
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = jsonLdText;
    } else {
      document.head.querySelector('script#seo-jsonld')?.remove();
    }
  }, [fullTitle, finalDescription, keywordsText, noindex, image, type, siteTitle, siteUrl, jsonLdText]);
}

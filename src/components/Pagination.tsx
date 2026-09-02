import { Link } from 'react-router-dom';

interface PaginationProps {
  /** 当前页（调用方已 clamp 到 [1, totalPages]）。 */
  page: number;
  totalPages: number;
  /** 基于当前 URL 参数合成目标页链接（page=1 时调用方应删除 ?page=）。 */
  makeHref: (page: number) => string;
}

const LINK_CLS =
  'rounded-brand border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary';
const DISABLED_CLS =
  'cursor-not-allowed rounded-brand border border-border px-3 py-1.5 text-sm text-muted opacity-50';
const CURRENT_CLS = 'rounded-brand bg-primary px-3 py-1.5 text-sm text-white';

/** 页码序列：总页数 ≤7 全显；>7 折叠为省略号（保留首尾与当前页前后各 1 页）。 */
function buildPages(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const wanted = new Set<number>();
  for (const n of [1, totalPages, page - 1, page, page + 1]) {
    if (n >= 1 && n <= totalPages) wanted.add(n);
  }
  const out: (number | '…')[] = [];
  for (let n = 1; n <= totalPages; n++) {
    if (wanted.has(n)) out.push(n);
    else if (out[out.length - 1] !== '…') out.push('…');
  }
  return out;
}

/** 分页条：上一页/下一页（边界禁用）+ 页码；totalPages ≤ 1 时不渲染。 */
export default function Pagination({ page, totalPages, makeHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const link = (target: number, label: string, disabled: boolean) =>
    disabled ? (
      <span key={label} aria-disabled="true" className={DISABLED_CLS}>
        {label}
      </span>
    ) : (
      <Link
        key={label}
        to={makeHref(target)}
        aria-label={label}
        className={LINK_CLS}
        onClick={() => window.scrollTo({ top: 0 })}
      >
        {label}
      </Link>
    );

  return (
    <nav aria-label="分页" className="flex flex-wrap items-center justify-center gap-2">
      {link(page - 1, '上一页', page <= 1)}
      {buildPages(page, totalPages).map((item, i) =>
        item === '…' ? (
          <span key={`ellipsis-${i}`} aria-hidden="true" className="px-1 text-sm text-muted">
            …
          </span>
        ) : item === page ? (
          <span key={item} aria-current="page" className={CURRENT_CLS}>
            {item}
          </span>
        ) : (
          <Link
            key={item}
            to={makeHref(item)}
            aria-label={`第 ${item} 页`}
            className={LINK_CLS}
            onClick={() => window.scrollTo({ top: 0 })}
          >
            {item}
          </Link>
        )
      )}
      {link(page + 1, '下一页', page >= totalPages)}
    </nav>
  );
}

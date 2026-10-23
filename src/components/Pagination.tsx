import { Link } from 'react-router-dom';

interface PaginationProps {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}

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
      <span key={label} aria-disabled="true" className="pager__link pager__link--disabled">
        {label}
      </span>
    ) : (
      <Link key={label} to={makeHref(target)} aria-label={label} className="pager__link" onClick={() => window.scrollTo({ top: 0 })}>
        {label}
      </Link>
    );

  return (
    <nav aria-label="分页" className="pager">
      {link(page - 1, '← 上一页', page <= 1)}
      {buildPages(page, totalPages).map((item, index) =>
        item === '…' ? (
          <span key={`ellipsis-${index}`} aria-hidden="true" className="pager__ellipsis">…</span>
        ) : item === page ? (
          <span key={item} aria-current="page" className="pager__current">{item}</span>
        ) : (
          <Link key={item} to={makeHref(item)} aria-label={`第 ${item} 页`} className="pager__link" onClick={() => window.scrollTo({ top: 0 })}>
            {item}
          </Link>
        )
      )}
      {link(page + 1, '下一页 →', page >= totalPages)}
    </nav>
  );
}

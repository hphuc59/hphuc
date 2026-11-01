import { Fragment } from "react";
import Link from "next/link";

type Props = { page: number; total: number; href: (n: number) => string };

export default function Pager({ page, total, href }: Props) {
  if (total < 2) return <nav className="pager" aria-label="Phân trang" />;
  const pages = [...new Set([1, total, page - 1, page, page + 1].filter((x) => x >= 1 && x <= total))].sort(
    (a, b) => a - b,
  );
  let last = 0;
  return (
    <nav className="pager" aria-label="Phân trang">
      {page < 2 ? (
        <span className="dis" aria-label="Trang trước">‹</span>
      ) : (
        <Link href={href(page - 1)} aria-label="Trang trước">‹</Link>
      )}
      {pages.map((x) => {
        const gap = x - last > 1;
        last = x;
        return (
          <Fragment key={x}>
            {gap && <i>…</i>}
            <Link
              href={href(x)}
              className={x === page ? "on" : undefined}
              aria-current={x === page ? "page" : undefined}
            >
              {x}
            </Link>
          </Fragment>
        );
      })}
      {page >= total ? (
        <span className="dis" aria-label="Trang sau">›</span>
      ) : (
        <Link href={href(page + 1)} aria-label="Trang sau">›</Link>
      )}
    </nav>
  );
}

import { Fragment } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = { page: number; total: number; href: (n: number) => string };

export default function Pager({ page, total, href }: Props) {
  if (total < 2) return null;
  const pages = [...new Set([1, total, page - 1, page, page + 1].filter((x) => x >= 1 && x <= total))].sort(
    (a, b) => a - b,
  );
  const base = "min-w-10 px-3";
  let last = 0;
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-1.5" aria-label="Phân trang">
      {page < 2 ? (
        <span className={cn(buttonVariants({ variant: "outline" }), base, "pointer-events-none opacity-40")} aria-label="Trang trước">
          <ChevronLeft />
        </span>
      ) : (
        <Link href={href(page - 1)} className={cn(buttonVariants({ variant: "outline" }), base)} aria-label="Trang trước">
          <ChevronLeft />
        </Link>
      )}
      {pages.map((x) => {
        const gap = x - last > 1;
        last = x;
        return (
          <Fragment key={x}>
            {gap && <span className="px-1 text-muted-foreground">…</span>}
            <Link
              href={href(x)}
              aria-current={x === page ? "page" : undefined}
              className={cn(buttonVariants({ variant: x === page ? "default" : "outline" }), base)}
            >
              {x}
            </Link>
          </Fragment>
        );
      })}
      {page >= total ? (
        <span className={cn(buttonVariants({ variant: "outline" }), base, "pointer-events-none opacity-40")} aria-label="Trang sau">
          <ChevronRight />
        </span>
      ) : (
        <Link href={href(page + 1)} className={cn(buttonVariants({ variant: "outline" }), base)} aria-label="Trang sau">
          <ChevronRight />
        </Link>
      )}
    </nav>
  );
}

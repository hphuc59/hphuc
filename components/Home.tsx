"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { MOVIES, PER, isAnime, loai, tl, type Movie } from "@/lib/movies";
import { LIST_KEY } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "./Logo";
import Filters, { type Group, type Key } from "./Filters";
import MovieCard from "./MovieCard";
import Pager from "./Pager";

/* Bốn mục ghim là bộ lọc LOẠI; danh sách Thể loại chỉ hiện thể loại của loại đang chọn */
const GHIM = ["Phim lẻ", "Phim bộ", "Anime lẻ", "Anime bộ"];
const KEYS: Key[] = ["genre", "country", "year"];

/* Trang chủ = tất cả; /phim = chỉ phim; /anime = chỉ anime */
export type Scope = "all" | "phim" | "anime";
const NAV: { href: string; label: string; scope: Scope }[] = [
  { href: "/", label: "Trang chủ", scope: "all" },
  { href: "/phim", label: "Phim", scope: "phim" },
  { href: "/anime", label: "Anime", scope: "anime" },
];
const pinOf = (scope: Scope) =>
  scope === "phim" ? GHIM.slice(0, 2) : scope === "anime" ? GHIM.slice(2) : GHIM;

type State = { q: string; genre: string[]; country: string[]; year: string[] };

const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

function match(m: Movie, s: State, skip: string[] = []) {
  const ty = s.genre.filter((g) => GHIM.includes(g));
  const ge = s.genre.filter((g) => !GHIM.includes(g));
  const q = norm(s.q.trim());
  if (
    q &&
    !norm([m.title, m.orig.join(" "), loai(m), m.note, m.country, m.year, m.genres.join(" ")].join(" ")).includes(q)
  )
    return false;
  if (!skip.includes("ty") && ty.length && !ty.includes(loai(m))) return false;
  if (!skip.includes("genre") && ge.length && !tl(m).some((g) => ge.includes(g))) return false;
  if (!skip.includes("country") && s.country.length && !s.country.includes(m.country)) return false;
  if (!skip.includes("year") && s.year.length && !s.year.includes(String(m.year))) return false;
  return true;
}

export default function Home({ scope = "all" }: { scope?: Scope }) {
  /* chỉ lấy phim thuộc trang đang xem; bộ lọc (thể loại, năm, quốc gia) tính trên tập này */
  const base = scope === "phim" ? MOVIES.filter((m) => !isAnime(m)) : scope === "anime" ? MOVIES.filter(isAnime) : MOVIES;
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const spStr = sp.toString();

  const list = (k: string) => (sp.get(k) || "").split("|").filter(Boolean);
  const s: State = { q: sp.get("q") || "", genre: list("genre"), country: list("country"), year: list("year") };
  const P = Math.max(1, +(sp.get("p") || 1) || 1);

  const [text, setText] = useState(s.q);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<string[]>(() => KEYS.filter((k) => list(k).length));

  const push = (n: State, p = 1) => {
    const u = new URLSearchParams();
    if (n.q) u.set("q", n.q);
    KEYS.forEach((k) => n[k].length && u.set(k, n[k].join("|")));
    if (p > 1) u.set("p", String(p));
    const qs = u.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const matched = base.filter((m) => match(m, s));
  const N = Math.max(1, Math.ceil(matched.length / PER));
  const page = matched.slice((P - 1) * PER, P * PER);

  /* nhớ địa chỉ danh sách để nút "Danh sách phim" ở trang xem quay về đúng trang + bộ lọc */
  useEffect(() => {
    try {
      sessionStorage.setItem(LIST_KEY, pathname + (spStr ? "?" + spStr : ""));
    } catch {}
  }, [pathname, spStr]);

  /* trang vượt quá số trang hiện có → về trang cuối */
  useEffect(() => {
    if (P > N) push(s, N);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [P, N]);

  /* đồng bộ ô tìm kiếm khi bấm Back/Forward (không ghi đè lúc đang gõ) */
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setText(s.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.q]);

  const toggle = (k: Key, v: string) => {
    const cur = s[k];
    const next = v === "" ? [] : cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    push({ ...s, [k]: next });
  };
  const nSel = KEYS.reduce((n, k) => n + s[k].length, 0);
  const clear = () => push({ q: s.q, genre: [], country: [], year: [] });

  const mk = (
    key: Key,
    label: string,
    allLabel: string,
    sort: (a: string, b: string) => number,
    pin: string[] = [],
  ): Group => {
    const c: Record<string, number> = {};
    const add = (x: string) => {
      if (x) c[x] = (c[x] || 0) + 1;
    };
    base.filter((m) => match(m, s, [key])).forEach((m) =>
      (key === "genre" ? tl(m) : [String(m[key])]).forEach(add),
    );
    /* số phim của bốn loại không bị thu hẹp bởi loại đang chọn */
    if (key === "genre") base.filter((m) => match(m, s, ["genre", "ty"])).forEach((m) => add(loai(m)));
    const keys = [
      ...pin,
      ...[...new Set([...Object.keys(c), ...s[key]])].filter((k) => !pin.includes(k)).sort(sort),
    ];
    return {
      key,
      label,
      allLabel,
      total: base.filter((m) => match(m, s, [key])).length,
      keys,
      counts: c,
      selected: s[key],
      pin,
    };
  };
  const vi = (a: string, b: string) => a.localeCompare(b, "vi");
  const groups: Group[] = [
    mk("genre", "Thể loại", "Tất cả thể loại", vi, pinOf(scope)),
    mk("country", "Quốc gia", "Tất cả quốc gia", vi),
    mk("year", "Năm phim", "Tất cả năm", (a, b) => +b - +a),
  ];

  const hrefFor = (n: number) => {
    const u = new URLSearchParams(spStr);
    if (n > 1) u.set("p", String(n));
    else u.delete("p");
    const qs = u.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const chips = KEYS.flatMap((k) => s[k].map((v) => ({ k, v })));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Kho Phim - Trang chủ">
            <Logo className="size-9" />
            <span className="text-xl font-extrabold tracking-tight">Kho Phim</span>
          </Link>

          <Tabs
            value={scope}
            onValueChange={(v) => {
              const t = NAV.find((n) => n.scope === v);
              if (t && t.scope !== scope) router.push(t.href);
            }}
            className="order-last w-full sm:order-none sm:w-auto"
          >
            <TabsList className="w-full sm:w-auto">
              {NAV.map((n) => (
                <TabsTrigger key={n.scope} value={n.scope}>
                  {n.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 sm:max-w-md">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                id="q"
                value={text}
                className="pl-9"
                placeholder="Tìm phim, quốc gia, thể loại…"
                onChange={(e) => {
                  setText(e.target.value);
                  push({ ...s, q: e.target.value });
                }}
              />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="shrink-0">
                  <SlidersHorizontal />
                  <span className="hidden sm:inline">Bộ lọc</span>
                  {nSel > 0 && <Badge className="px-2">{nSel}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle>Bộ lọc</SheetTitle>
                <SheetDescription className="sr-only">Lọc phim theo thể loại, quốc gia và năm</SheetDescription>
                {nSel > 0 && (
                  <Button variant="outline" size="sm" className="self-start text-primary" onClick={clear}>
                    Bỏ hết bộ lọc
                  </Button>
                )}
                <div className="-mr-2 flex-1 overflow-y-auto pr-2">
                  <Filters groups={groups} open={open} onOpenChange={setOpen} onToggle={toggle} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <p className="mr-2 text-sm text-muted-foreground">
            {matched.length} / {base.length} phim{N > 1 ? ` · Trang ${P}/${N}` : ""}
          </p>
          {chips.map(({ k, v }) => (
            <button
              key={k + v}
              type="button"
              onClick={() => toggle(k, v)}
              className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary outline-none transition hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Bỏ lọc ${v}`}
            >
              {v}
              <X className="size-3" />
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {page.map((m, i) => (
              <MovieCard key={m.id} m={m} index={i} />
            ))}
          </AnimatePresence>
          {!page.length && (
            <div className="col-span-full py-20 text-center text-muted-foreground">Không có phim nào khớp bộ lọc.</div>
          )}
        </div>
        <Pager page={P} total={N} href={hrefFor} />
      </main>
    </div>
  );
}

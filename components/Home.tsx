"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { MOVIES, PER, isAnime, loai, tl, type Movie } from "@/lib/movies";
import { LIST_KEY } from "@/lib/storage";
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
  const [side, setSide] = useState(false); /* menu trượt trên điện thoại */
  const [filterOpen, setFilterOpen] = useState(false); /* bật/tắt cả khối Bộ lọc */
  const [collapsed, setCollapsed] = useState(false); /* ẩn/hiện menu trên máy tính */

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
  const hasFilter = KEYS.some((k) => s[k].length);
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

  const mob = () => window.matchMedia("(max-width:760px)").matches;

  return (
    <div className={"app" + (collapsed ? " collapsed" : "")}>
      <aside id="side" className={side ? "open" : undefined}>
        <div className="brandrow">
          <Link className="site" href="/" aria-label="Kho Phim - Trang chủ">
            <Logo />
            <span>Kho Phim</span>
          </Link>
          <button
            id="close"
            type="button"
            aria-label="Tắt menu"
            title="Tắt menu"
            onClick={() => (mob() ? setSide(false) : setCollapsed(true))}
          >
            ✕
          </button>
        </div>
        <nav className="menu" aria-label="Menu chính">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={n.scope === scope ? "on" : undefined}
              aria-current={n.scope === scope ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="ftoggle"
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen((o) => !o)}
        >
          <span>
            Bộ lọc{!filterOpen && nSel > 0 ? <em>{nSel}</em> : null}
          </span>
          <b>▾</b>
        </button>
        <AnimatePresence initial={false}>
          {filterOpen && (
            <motion.div
              key="fbody"
              style={{ overflow: "hidden" }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
            >
              <AnimatePresence initial={false}>
                {hasFilter && (
                  <motion.button
                    key="clear"
                    type="button"
                    className="clear"
                    onClick={clear}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    Bỏ hết bộ lọc
                  </motion.button>
                )}
              </AnimatePresence>
              <Filters groups={groups} open={open} onOpenChange={setOpen} onToggle={toggle} />
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      <main onClick={(e) => !(e.target as HTMLElement).closest("#menu") && setSide(false)}>
        <div className="top">
          <button id="menu" type="button" onClick={() => (mob() ? setSide((o) => !o) : setCollapsed((c) => !c))}>
            ☰
          </button>
          <input
            ref={inputRef}
            type="search"
            id="q"
            value={text}
            placeholder="Tìm phim theo tên, quốc gia, thể loại, ghi chú…"
            onChange={(e) => {
              setText(e.target.value);
              push({ ...s, q: e.target.value });
            }}
          />
        </div>
        <p className="info">
          {matched.length} / {base.length} phim{N > 1 ? ` · Trang ${P}/${N}` : ""}
        </p>
        <div className="grid" id="grid">
          <AnimatePresence mode="popLayout">
            {page.map((m, i) => (
              <MovieCard key={m.id} m={m} index={i} />
            ))}
          </AnimatePresence>
          {!page.length && <div className="empty">Không có phim nào khớp bộ lọc.</div>}
        </div>
        <Pager page={P} total={N} href={hrefFor} />
      </main>
    </div>
  );
}

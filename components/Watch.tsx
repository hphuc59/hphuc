"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Movie } from "@/lib/movies-core";
import { epHref, loai, tl } from "@/lib/movies-core";
import { nameOf, serversOf } from "@/lib/links";
import { LIST_KEY, SERVER_KEY, getW, setL, setW } from "@/lib/storage";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

function Embed({ url, title, id }: { url: string; title: string; id: string }) {
  if (!url || /^\s*javascript:/i.test(url))
    return (
      <p className="p-4 text-center text-sm text-muted-foreground">
        Tập này chưa có link phim.
        <br />
        Dán link vào <code className="text-foreground">data/links.ts</code> (mã phim: <code className="text-foreground">{id}</code>).
      </p>
    );
  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(url)) return <video src={url} controls playsInline className="size-full bg-black" />;
  return (
    <iframe
      src={url}
      title={title}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      referrerPolicy="no-referrer"
      className="size-full border-0 bg-black"
    />
  );
}

export default function Watch({ movie: m, cur }: { movie: Movie; cur: number }) {
  const router = useRouter();
  const n = m.eps.length;
  const sv = serversOf(m.id, cur);
  const svLen = sv.length;
  const [pick, setPick] = useState(0);
  const [done, setDone] = useState<number[]>([cur]);

  /* mở trang tập nào là tập đó được đánh dấu ✓ và nhớ làm tập đang xem */
  useEffect(() => {
    const d = new Set(getW(m.id));
    d.add(cur);
    const arr = [...d].sort((a, b) => a - b);
    setW(m.id, arr);
    setL(m.id, cur);
    setDone(arr);
  }, [m.id, cur]);

  /* nhớ server đã chọn */
  useEffect(() => {
    try {
      setPick(Math.min(+(sessionStorage.getItem(SERVER_KEY) || 0), Math.max(0, svLen - 1)));
    } catch {}
  }, [m.id, cur, svLen]);

  const choose = (k: number) => {
    setPick(k);
    try {
      sessionStorage.setItem(SERVER_KEY, String(k));
    } catch {}
  };

  /* quay lại danh sách đúng trang và bộ lọc đang xem */
  const back = (e: React.MouseEvent) => {
    try {
      const u = sessionStorage.getItem(LIST_KEY);
      if (u) {
        e.preventDefault();
        router.push(u);
      }
    } catch {}
  };

  const info = [m.year, m.country, n > 1 ? nameOf(m, cur) : "", m.note].filter(Boolean).join(" · ");

  return (
    <motion.div
      className="mx-auto max-w-5xl px-4 py-5 pt-[max(1.25rem,env(safe-area-inset-top))]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href="/"
        onClick={back}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-primary"
      >
        <ChevronLeft className="size-4" /> Danh sách phim
      </Link>

      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-black shadow-2xl shadow-black/60">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${cur}-${pick}`}
            className="grid size-full place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Embed url={sv[pick]?.url || ""} title={m.title} id={m.id} />
          </motion.div>
        </AnimatePresence>
      </div>

      {svLen > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {sv.map((x, k) => (
            <Button key={k} size="sm" variant={k === pick ? "default" : "outline"} onClick={() => choose(k)}>
              {x.name}
            </Button>
          ))}
        </div>
      )}

      <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight">{m.title}</h1>
      {m.orig.length > 0 && <p className="mt-1 text-sm italic text-muted-foreground">{m.orig.join(" · ")}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge>{loai(m)}</Badge>
        {tl(m).map((g) => (
          <Badge key={g} variant="secondary">
            {g}
          </Badge>
        ))}
        {info && <span>{info}</span>}
      </div>

      {n > 1 && (
        <>
          {cur < n - 1 && (
            <div className="mt-5">
              <Link href={epHref(m, cur + 1)} className={cn(buttonVariants(), "h-11 px-5")}>
                Tập tiếp theo <ChevronRight />
              </Link>
            </div>
          )}
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
            {m.eps.map((_, i) => (
              <MotionLink
                key={i}
                href={epHref(m, i)}
                aria-current={i === cur ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 px-2",
                  i === cur && "border-primary font-bold text-primary",
                  i !== cur && done.includes(i) && "text-muted-foreground",
                )}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i, 20) * 0.015 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {nameOf(m, i)}
              </MotionLink>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

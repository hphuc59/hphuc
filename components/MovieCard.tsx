"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { epHref, loai, tl, type Movie } from "@/lib/movies";
import { getL, getW } from "@/lib/storage";

export default function MovieCard({ m, index }: { m: Movie; index: number }) {
  const [prog, setProg] = useState({ seen: 0, k: 0 });
  const [bad, setBad] = useState(false);

  /* tiến độ xem lấy từ localStorage nên chỉ đọc sau khi trang đã chạy trên trình duyệt */
  useEffect(() => {
    setProg({
      seen: getW(m.id).length,
      k: Math.min(Math.max(0, getL(m.id)), m.eps.length - 1),
    });
  }, [m.id, m.eps.length]);

  return (
    <motion.div
      className="group min-w-0"
      layout="position"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={epHref(m, prog.k)}
        aria-label={m.title}
        className="relative flex aspect-[2/3] items-center justify-center overflow-hidden rounded-xl bg-secondary text-5xl font-extrabold text-muted-foreground/30 shadow-lg shadow-black/40 ring-1 ring-border outline-none transition focus-visible:ring-2 focus-visible:ring-ring group-hover:ring-primary/60"
      >
        {(m.title || "?").trim().charAt(0).toUpperCase()}
        {m.poster && !bad && (
          <img
            src={m.poster}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setBad(true)}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <Badge variant="glass" className="absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)] truncate">
          {loai(m)}
        </Badge>
        <span className="absolute inset-0 z-10 grid place-items-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="grid size-12 place-items-center rounded-full border-[1.5px] border-white text-white">
            <Play className="size-5 translate-x-0.5 fill-current" />
          </span>
        </span>
      </Link>
      <div className="px-0.5 pt-2.5">
        <h4 className="line-clamp-2 text-[15px] font-semibold leading-snug">{m.title}</h4>
        <p className="mt-0.5 text-xs text-muted-foreground">{[m.year, m.country].filter(Boolean).join(" · ")}</p>
        {tl(m).length > 0 && <p className="line-clamp-1 text-xs text-muted-foreground">{tl(m).join(", ")}</p>}
        {m.note && <p className="text-xs text-muted-foreground">{m.note}</p>}
        {prog.seen > 0 && (
          <p className="mt-0.5 text-xs font-medium text-primary">
            Đã xem {prog.seen}/{m.eps.length}
          </p>

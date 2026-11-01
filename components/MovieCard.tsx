"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Card } from "open-glass-ui";
import { epHref, loaiText, type Movie } from "@/lib/movies";
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
      className="card"
      layout="position"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ y: -4 }}
    >
      <Card interactive className="card-glass">
      <Link className="poster" href={epHref(m, prog.k)} aria-label={m.title}>
        {(m.title || "?").trim().charAt(0).toUpperCase()}
        {m.poster && !bad && (
          <img
            src={m.poster}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setBad(true)}
          />
        )}
      </Link>
      <div className="meta">
        <h4>{m.title}</h4>
        <p>{[m.year, m.country].filter(Boolean).join(" · ")}</p>
        <p>{loaiText(m)}</p>
        {m.note && <p>{m.note}</p>}
        {prog.seen > 0 && (
          <p className="seen">
            Đã xem {prog.seen}/{m.eps.length}
          </p>
        )}
      </div>
      </Card>
    </motion.div>
  );
}

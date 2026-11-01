"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Movie } from "@/lib/movies-core";
import { loaiText } from "@/lib/movies-core";
import { nameOf, serversOf } from "@/lib/links";
import { LIST_KEY, SERVER_KEY, getW, setL, setW } from "@/lib/storage";

const MotionLink = motion.create(Link);

function Embed({ url, title, id }: { url: string; title: string; id: string }) {
  if (!url || /^\s*javascript:/i.test(url))
    return (
      <p>
        Tập này chưa có link phim.
        <br />
        Dán link vào <code>data/links.ts</code> (mã phim: <code>{id}</code>).
      </p>
    );
  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(url)) return <video src={url} controls playsInline />;
  return (
    <iframe
      src={url}
      title={title}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      referrerPolicy="no-referrer"
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

  const info = [m.year, m.country, loaiText(m), n > 1 ? nameOf(m, cur) : "", m.note].filter(Boolean).join(" · ");

  return (
    <motion.div className="wrap" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Link className="back" href="/" onClick={back}>
        ‹ Danh sách phim
      </Link>

      <div className="player">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${cur}-${pick}`}
            style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}
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
        <div className="eps servers">
          {sv.map((x, k) => (
            <button type="button" key={k} className={"ep" + (k === pick ? " cur" : "")} onClick={() => choose(k)}>
              {x.name}
            </button>
          ))}
        </div>
      )}

      <h1 className="wtitle">{m.title}</h1>
      {m.orig.length > 0 && <p className="worig">{m.orig.join(" · ")}</p>}
      <p className="info">{info}</p>

      {n > 1 && (
        <>
          {cur < n - 1 && (
            <div className="acts">
              <Link className="btn pri" href={`/phim/${m.id}/${cur + 2}`}>
                Tập tiếp theo ›
              </Link>
            </div>
          )}
          <div className="eps">
            {m.eps.map((_, i) => (
              <MotionLink
                key={i}
                href={`/phim/${m.id}/${i + 1}`}
                className={"ep" + (i === cur ? " cur" : "") + (done.includes(i) ? " done" : "")}
                aria-current={i === cur ? "page" : undefined}
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

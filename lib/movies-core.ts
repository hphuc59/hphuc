export type Movie = {
  id: string;
  title: string;
  orig: string[];
  year: number;
  country: string;
  genres: string[];
  poster: string;
  note: string;
  eps: { name: string }[];
};

export const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* M(tên, năm, quốc gia, thể loại, số tập, poster, tên gốc) */
export const M = (
  title: string,
  year: number,
  country: string,
  genres: string | string[],
  eps: number = 1,
  poster: string = "",
  orig: string | string[] = "",
): Movie => {
  const k = eps || 1;
  return {
    id: slug(title),
    title,
    orig: ([] as string[]).concat(orig || []).filter(Boolean),
    year,
    country,
    genres: ([] as string[])
      .concat(genres || [])
      .join("/")
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean),
    poster,
    note: "",
    eps: Array.from({ length: k }, (_, i) => ({
      name: k === 1 ? "Full" : "Tập " + (i + 1),
    })),
  };
};

/* Địa chỉ xem phim: phim 1 tập → /phim/<mã>/xem-phim ; phim nhiều tập → /phim/<mã>/tap-N */
export const epSeg = (m: Movie, i: number) => (m.eps.length < 2 ? "xem-phim" : `tap-${i + 1}`);
export const epHref = (m: Movie, i: number) => `/phim/${m.id}/${epSeg(m, i)}`;
export const epIndex = (m: Movie, seg: string) => {
  if (m.eps.length < 2) return seg === "xem-phim" ? 0 : -1;
  const mt = /^tap-(\d+)$/.exec(seg);
  return mt ? +mt[1] - 1 : -1;
};

/* Phân loại tự động: Phim lẻ / Phim bộ / Anime lẻ / Anime bộ */
const isAnimeTag = (s: string) => s.toLowerCase() === "anime";
export const isAnime = (m: Movie) => m.genres.some(isAnimeTag);
export const loai = (m: Movie) =>
  (isAnime(m) ? "Anime" : "Phim") + (m.eps.length < 2 ? " lẻ" : " bộ");
export const tl = (m: Movie) => m.genres.filter((x) => !isAnimeTag(x));
export const loaiText = (m: Movie) => [loai(m), ...tl(m)].join(", ");

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOVIES, epIndex, epSeg, findMovie } from "@/lib/movies";
import { nameOf } from "@/lib/links";
import Watch from "@/components/Watch";

export const dynamicParams = false;
export const generateStaticParams = () =>
  MOVIES.flatMap((m) => m.eps.map((_, i) => ({ id: m.id, tap: epSeg(m, i) })));

type Props = { params: Promise<{ id: string; tap: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, tap } = await params;
  const m = findMovie(id);
  const i = m ? epIndex(m, tap) : -1;
  if (!m || !m.eps[i]) return { title: "Kho Phim" };
  return { title: m.title + (m.eps.length > 1 ? " - " + nameOf(m, i) : "") + " - Kho Phim" };
}

export default async function Page({ params }: Props) {
  const { id, tap } = await params;
  const m = findMovie(id);
  const i = m ? epIndex(m, tap) : -1;
  if (!m || !m.eps[i]) notFound();
  return <Watch movie={m} cur={i} />;
}

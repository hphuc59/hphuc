import { notFound, redirect } from "next/navigation";
import { MOVIES, epHref, findMovie } from "@/lib/movies";

export const dynamicParams = false;
export const generateStaticParams = () => MOVIES.map((m) => ({ id: m.id }));

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = findMovie(id);
  if (!m) notFound();
  redirect(epHref(m, 0));
}

import { redirect } from "next/navigation";
import { MOVIES } from "@/lib/movies";

export const dynamicParams = false;
export const generateStaticParams = () => MOVIES.map((m) => ({ id: m.id }));

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/phim/${id}/1`);
}

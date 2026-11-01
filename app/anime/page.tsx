import type { Metadata } from "next";
import { Suspense } from "react";
import Home from "@/components/Home";

export const metadata: Metadata = { title: "Anime - Kho Phim" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Home scope="anime" />
    </Suspense>
  );
}

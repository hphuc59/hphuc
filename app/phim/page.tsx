import type { Metadata } from "next";
import { Suspense } from "react";
import Home from "@/components/Home";

export const metadata: Metadata = { title: "Phim - Kho Phim" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Home scope="phim" />
    </Suspense>
  );
}

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> Danh sách phim
      </Link>
      <p className="text-muted-foreground">Không tìm thấy phim này. Quay lại danh sách để chọn phim khác.</p>
    </div>
  );
}

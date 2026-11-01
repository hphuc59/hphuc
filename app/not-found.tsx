import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <Link className="back" href="/">
        ‹ Danh sách phim
      </Link>
      <p className="info">Không tìm thấy phim này. Quay lại danh sách để chọn phim khác.</p>
    </div>
  );
}

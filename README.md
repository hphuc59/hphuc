# Kho Phim (Next.js + Animate UI)

## Chạy thử
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build production (Vercel tự nhận Next.js, không cần vercel.json)
```

## Thêm phim
1. Mở `data/kho/1.ts`, thêm một dòng:
   `M('Tên phim', 2024, 'Nhật Bản', 'Anime/Comedy', 12, 'https://link-poster.jpg', ['Tên gốc'])`
   (tên, năm, quốc gia, thể loại cách nhau bằng `/`, số tập, poster, tên gốc). Mã phim tự sinh từ tên.
2. Mở `data/links.ts`, thêm `"ma-phim": [ ...link từng tập... ]`.
Muốn tách kho mới: tạo `data/kho/2.ts` rồi import vào `lib/movies.ts`.

## Thêm component Animate UI khác
```bash
npx shadcn@latest init
npx shadcn@latest add @animate-ui/components-radix-tabs
```
Bộ lọc đang dùng Accordion của Animate UI (`components/Filters.tsx`).
Hiệu ứng thẻ phim, tập phim, trình phát dùng `motion`.

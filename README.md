# Kho Phim — Next.js + Tailwind v4 + shadcn/ui + Animate UI

## Chạy thử
```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Bật animation Animate UI cho toàn bộ component shadcn
`components/ui/` là component kiểu shadcn/ui (Tabs, Sheet, Button, Input, Badge, Accordion).
Accordion đã dùng sẵn primitive của Animate UI. Muốn animate luôn Tabs và Sheet, chạy 1 lệnh:

```bash
npx @animate-ui/cli@latest animate all
```
Lệnh này đổi `import ... from "radix-ui"` thành primitive của Animate UI. Không chạy cũng không sao, web vẫn chạy bình thường.

Thêm component khác: `npx shadcn@latest add <tên>` (ví dụ `sonner`, `tooltip`).

## Thêm phim
1. `data/kho/1.ts`: thêm `M('Tên phim', 2024, 'Nhật Bản', 'Anime/Comedy', 12, 'https://poster.jpg', ['Tên gốc'])`
2. `data/links.ts`: thêm `"ma-phim": [ ...link từng tập... ]`

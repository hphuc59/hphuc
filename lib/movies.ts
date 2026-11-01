import kho1 from "@/data/kho/1";
/* Thêm kho mới: tạo data/kho/2.ts rồi import vào đây và thêm vào mảng bên dưới */

import type { Movie } from "./movies-core";

export const MOVIES: Movie[] = [...kho1];
export const PER = 8; /* số phim mỗi trang */

export const findMovie = (id: string) => MOVIES.find((m) => m.id === id);
export * from "./movies-core";

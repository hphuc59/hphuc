/* Đánh dấu tập đã xem / tập đang xem dở — lưu trong trình duyệt (localStorage).
   Chỉ gọi trong useEffect hoặc event handler (không chạy lúc render phía server). */
const WK = "phim.watched";
const LK = "phim.last";

const read = (k: string): Record<string, unknown> => {
  try {
    return JSON.parse(localStorage.getItem(k) || "{}");
  } catch {
    return {};
  }
};
const write = (k: string, o: Record<string, unknown>) => {
  try {
    localStorage.setItem(k, JSON.stringify(o));
  } catch {}
};

export const getW = (id: string): number[] => (read(WK)[id] as number[]) || [];
export const setW = (id: string, a: number[]) => write(WK, { ...read(WK), [id]: a });
export const getL = (id: string): number => +((read(LK)[id] as number) || 0);
export const setL = (id: string, i: number) => write(LK, { ...read(LK), [id]: i });

export const LIST_KEY = "phim.list";
export const SERVER_KEY = "phim.server";

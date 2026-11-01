import { LINKS } from "@/data/links";
import type { Movie } from "./movies-core";

export type Server = { name?: string; url?: string };
export type EpLink =
  | string
  | Server
  | { name?: string; servers: (string | Server)[] }
  | (string | Server)[];

export type ServerOut = { name: string; url: string };

export function serversOf(id: string, i: number): ServerOut[] {
  const l = (LINKS[id] || [])[i] as EpLink | undefined;
  const a: (string | Server | undefined)[] = Array.isArray(l)
    ? l
    : l && typeof l === "object" && "servers" in l
      ? l.servers
      : [l as string | Server | undefined];
  return a
    .map((s, k) =>
      typeof s === "string"
        ? { name: "Server " + (k + 1), url: s }
        : { name: (s && s.name) || "Server " + (k + 1), url: (s && s.url) || "" },
    )
    .filter((s) => s.url);
}

export function nameOf(m: Movie, i: number): string {
  const l = (LINKS[m.id] || [])[i] as EpLink | undefined;
  const n = l && !Array.isArray(l) && typeof l === "object" ? l.name : undefined;
  return n || m.eps[i].name;
}

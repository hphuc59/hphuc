"use client";

/* Bộ lọc bên trái: dùng Accordion của Animate UI (primitive Radix đã gắn animation Motion).
   Muốn đổi sang Base UI thì đổi đường dẫn import thành '@animate-ui/react/primitives/base-ui'. */
import { Accordion as AccordionPrimitive } from "@animate-ui/react/primitives/radix-ui";

export type Key = "genre" | "country" | "year";

export type Group = {
  key: Key;
  label: string;
  allLabel: string;
  total: number;
  keys: string[];
  counts: Record<string, number>;
  selected: string[];
  pin: string[];
};

type Props = {
  groups: Group[];
  open: string[];
  onOpenChange: (v: string[]) => void;
  onToggle: (key: Key, value: string) => void;
};

export default function Filters({ groups, open, onOpenChange, onToggle }: Props) {
  return (
    <AccordionPrimitive.Root type="multiple" value={open} onValueChange={onOpenChange}>
      {groups.map((g) => (
        <AccordionPrimitive.Item key={g.key} value={g.key} className="grp">
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="gt">
              <span>{g.label}</span>
              <b>▾</b>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content>
            <div className="list">
              <button
                type="button"
                className={"nav one" + (g.selected.length ? "" : " on")}
                onClick={() => onToggle(g.key, "")}
              >
                <span>{g.allLabel}</span>
                <small>{g.total}</small>
              </button>
              {g.keys.map((v) => {
                const on = g.selected.includes(v);
                return (
                  <button
                    type="button"
                    key={v}
                    className={"nav" + (g.pin.includes(v) ? " pin" : "") + (on ? " on" : "")}
                    onClick={() => onToggle(g.key, v)}
                  >
                    <i className="box">{on ? "✓" : ""}</i>
                    <span>{v}</span>
                    <small>{g.counts[v] || 0}</small>
                  </button>
                );
              })}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}

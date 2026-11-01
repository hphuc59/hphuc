"use client";

import { Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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

function Row({
  label,
  count,
  on,
  box,
  pin,
  onClick,
}: {
  label: string;
  count: number;
  on: boolean;
  box?: boolean;
  pin?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
        on && !box && "bg-primary font-semibold text-primary-foreground hover:bg-primary",
        on && box && "text-primary",
        !on && pin && "font-semibold text-primary",
      )}
    >
      {box && (
        <span
          className={cn(
            "grid size-4 shrink-0 place-items-center rounded border",
            on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/60",
          )}
        >
          {on && <Check className="size-3" strokeWidth={3} />}
        </span>
      )}
      <span className="flex-1 truncate">{label}</span>
      <small className={cn("text-xs", on && !box ? "text-primary-foreground/80" : "text-muted-foreground")}>{count}</small>
    </button>
  );
}

export default function Filters({ groups, open, onOpenChange, onToggle }: Props) {
  return (
    <Accordion type="multiple" value={open} onValueChange={onOpenChange}>
      {groups.map((g) => (
        <AccordionItem key={g.key} value={g.key}>
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              {g.label}
              {g.selected.length > 0 && (
                <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">{g.selected.length}</span>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="max-h-64 space-y-0.5 overflow-y-auto pr-1">
              <Row label={g.allLabel} count={g.total} on={g.selected.length === 0} onClick={() => onToggle(g.key, "")} />
              {g.keys.map((v) => (
                <Row
                  key={v}
                  box
                  label={v}
                  count={g.counts[v] || 0}
                  on={g.selected.includes(v)}
                  pin={g.pin.includes(v)}
                  onClick={() => onToggle(g.key, v)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

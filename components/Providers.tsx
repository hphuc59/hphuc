"use client";

import { GlassSystemProvider } from "open-glass-ui";

/* OpenGlass UI: một provider cho cả web. renderer="auto" = CSS thuần (không tự bật WebGL/SVG). */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GlassSystemProvider renderer="auto" theme={{ appearance: "dark" }}>
      {children}
    </GlassSystemProvider>
  );
}

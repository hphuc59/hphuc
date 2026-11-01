import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "open-glass-ui/styles.css";
import "./globals.css";
import Providers from "@/components/Providers";

const font = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bvp",
  display: "swap",
});

export const metadata: Metadata = { title: "Kho Phim", description: "Kho Phim" };
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={font.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

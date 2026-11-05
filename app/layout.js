import "./globals.css";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { BRAND_NAME } from "@/lib/brand";
import SmoothScroll from "@/components/smooth-scroll";

// Main Global Font: Clash Display Variable
const clashDisplay = localFont({
  src: "../font/ClashDisplay-Variable.ttf",
  variable: "--font-clash",
  display: "swap",
});

// Display Header Font: Trento
const trento = localFont({
  src: "../font/Trento Typeface.ttf",
  variable: "--font-trento",
  display: "swap",
});

export const metadata = {
  title: `${BRAND_NAME.toUpperCase()}`,
  description: `Browse verified dealership inventory, search by photo, and book test drives with ${BRAND_NAME}.`,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${clashDisplay.variable} ${trento.variable}`}>
        <body className="overflow-x-clip bg-[#050505] font-[family-name:var(--font-clash)] text-white antialiased">
          <SmoothScroll>
            <main className="min-h-screen">{children}</main>
            <Toaster richColors theme="dark" />
          </SmoothScroll>
        </body>
      </html>
    </ClerkProvider>
  );
}

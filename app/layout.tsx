import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, VT323, Bagel_Fat_One } from "next/font/google";
import "./globals.css";
import "./y2k.css";
import { RetroPhoneAssistant } from "./components/RetroPhoneAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["italic"],
});

// Y2K pixel / LCD face
const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

// Bubbly display face for chrome headings
const bagel = Bagel_Fat_One({
  variable: "--font-bagel",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sreeja Das — Portfolio",
  description: "Creative developer, designer, and CTO portfolio by Sreeja Das.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${vt323.variable} ${bagel.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const originalWarn = console.warn;
              console.warn = function(...args) {
                if (typeof args[0] === "string" && args[0].includes("THREE.Clock: This module has been deprecated")) {
                  return;
                }
                originalWarn.apply(console, args);
              };
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-babypink text-ink selection:bg-bubblegum selection:text-ink">
        {children}
        <RetroPhoneAssistant />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unhinged Development Group",
  description:
    "A portfolio of companies built differently. Parent company to Groomr Ltd and Paper & Ponder Ltd.",
  icons: {
    icon: { url: "/unhinged/logo-unhinged-green.png", type: "image/png" },
    apple: { url: "/apple-icon", type: "image/png", sizes: "180x180" },
  },
  openGraph: {
    title: "Unhinged Development Group",
    description: "A portfolio of companies built differently.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Single:wght@100..900&family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-black">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

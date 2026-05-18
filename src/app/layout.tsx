import type { Metadata } from "next";
import "./globals.css";

const FAVICON_URL =
  "https://res.cloudinary.com/dr8adq7nl/image/upload/e_negate/co_rgb:D2FF14,e_colorize:100/c_fit,h_64,w_64/f_png/v1778965077/IMG_0772_l4ddjj.png";

export const metadata: Metadata = {
  title: "Unhinged Development Group",
  description:
    "A portfolio of companies built differently. Parent company to Groomr Ltd and Paper & Ponder Ltd.",
  icons: {
    icon: { url: FAVICON_URL, type: "image/png" },
    apple: {
      url: "https://res.cloudinary.com/dr8adq7nl/image/upload/e_negate/co_rgb:D2FF14,e_colorize:100/c_fit,h_180,w_180/f_png/v1778965077/IMG_0772_l4ddjj.png",
      type: "image/png",
    },
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
      <body className="font-sans">{children}</body>
    </html>
  );
}

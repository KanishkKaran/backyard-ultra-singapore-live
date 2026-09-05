import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://backyard-ultra-singapore-live.onrender.com"),
  title: "Beach Backyard Ultra — Live Team Singapore Coverage",
  description: "Just one more yard. Live yards, lap times, standings and course progress for Team Singapore.",
  openGraph: {
    title: "Beach Backyard Ultra — Live Team Singapore Coverage",
    description: "Just one more yard. Live yards, lap times, standings and course progress.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Beach Backyard Ultra — Just one more yard." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beach Backyard Ultra — Live Team Singapore Coverage",
    description: "Just one more yard. Live yards, lap times, standings and course progress.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/bbu-icon.png",
    shortcut: "/bbu-icon.png",
    apple: "/bbu-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

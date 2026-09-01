import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulseboard",
  description: "A focused task board built for automated quality testing"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="site-header">
          <Link href="/" className="brand" aria-label="Pulseboard home">Pulseboard</Link>
          <span className="header-note">Ship work with confidence.</span>
        </header>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}


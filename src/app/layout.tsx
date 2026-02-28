import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Savannah Trash Collection | Know Your Pickup Day",
  description:
    "Find your trash, recycling, and yard waste pickup schedule in Savannah, GA. Look up your collection day and never miss a pickup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-geist-sans)]`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-primary text-primary-foreground">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
              <a href="/" className="font-bold text-lg">
                Savannah Trash Collection
              </a>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t py-4 text-center text-sm text-muted-foreground">
            <div className="max-w-4xl mx-auto px-4">
              Carts must be at curb by 7:00 AM on collection day.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

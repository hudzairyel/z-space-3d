import type { Metadata } from "next";
import "./globals.css";
import "orbloom/styles.css";

export const metadata: Metadata = {
  title: "Z-Space - Image to 3D",
  description: "Generate 3D assets from text and images.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}

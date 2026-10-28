import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { siteUrl } from "@/lib/metadata";
const roboto = Roboto({
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
  subsets: ["latin", "cyrillic"],
});
import type { ReactNode } from "react";
import "modern-normalize/modern-normalize.css";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider/AuthProvider";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "NoteHub",
  description:
    "Create, search and organize your personal notes securely with NoteHub.",
  openGraph: {
    title: "NoteHub",
    description:
      "Create, search and organize your personal notes securely with NoteHub.",
    url: "/",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "NoteHub — manage your personal notes",
      },
    ],
  },
};
export default function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${roboto.className}`}>
        <TanStackProvider>
          <AuthProvider>
            <Header />
            {children}
            {modal}
            <Footer />
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}

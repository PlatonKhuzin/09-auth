import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "404 - Page not found | NoteHub",
  description: "Sorry, the page you are looking for does not exist.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "404 - Page not found | NoteHub",
    description: "Sorry, the page you are looking for does not exist.",
    url: "/404",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "NoteHub — page not found",
      },
    ],
  },
};
import css from "./NotFound.module.css";
export default function NotFound() {
  return (
    <main className={css.main}>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
    </main>
  );
}

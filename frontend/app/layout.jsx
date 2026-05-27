import './globals.css';

export const metadata = {
  title: 'AnimeWave — Anime Radio & Community',
  description: 'Vote for your favourite anime songs!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
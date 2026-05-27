import './globals.css';

export const metadata = {
  title: 'AnimeWave — Anime Radio & Community',
  description: 'Vote for your favourite anime songs!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
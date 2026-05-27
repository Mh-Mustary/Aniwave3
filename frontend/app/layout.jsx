import './globals.css';

export const metadata = {
  title: 'AnimeWave — Anime Radio & Community',
  description: 'Vote for your favourite anime songs, read articles, discover manga, and join the community.',
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

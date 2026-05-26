// frontend/app/layout.jsx
import './globals.css';

export const metadata = {
  title: 'AnimeWave — Anime Radio & Community',
  description: 'Vote for your favourite anime songs, read articles, discover manga, and join the community.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

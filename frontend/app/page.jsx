// frontend/app/page.jsx
// Main homepage — server component that fetches initial data, passes to client components

import { api } from '../lib/api';
import HomeClient from './HomeClient';

export const revalidate = 60; // ISR — re-fetch every 60s

async function getData() {
  try {
    const [songsData, articlesData, mangaData, exclusiveData] = await Promise.allSettled([
      api.getSongs({ limit: 10 }),
      api.getArticles({ limit: 9 }),
      api.getManga({ limit: 12 }),
      api.getExclusive(),
    ]);

    return {
      songs: songsData.status === 'fulfilled' ? songsData.value.songs : [],
      articles: articlesData.status === 'fulfilled' ? articlesData.value.articles : [],
      manga: mangaData.status === 'fulfilled' ? mangaData.value : [],
      exclusive: exclusiveData.status === 'fulfilled' ? exclusiveData.value : [],
    };
  } catch {
    return { songs: [], articles: [], manga: [], exclusive: [] };
  }
}

export default async function HomePage() {
  const data = await getData();
  return <HomeClient {...data} />;
}

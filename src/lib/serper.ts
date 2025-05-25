import axios from 'axios';
import { getSerperApiKey } from './config';

interface SerperSearchOptions {
  num?: number;
  page?: number;
  gl?: string;
  hl?: string;
}

interface SerperSearchResult {
  title: string;
  url: string;
  snippet?: string;
  position?: number;
  content?: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  author?: string;
  iframe_src?: string;
}

export const searchSerper = async (
  query: string,
  opts?: SerperSearchOptions,
) => {
  const apiKey = getSerperApiKey();
  if (!apiKey) {
    throw new Error('Serper API key is not configured');
  }

  const endpoint = 'https://google.serper.dev/search';
  
  const payload = {
    q: query,
    num: opts?.num || 10,
    page: opts?.page || 1,
    gl: opts?.gl || 'us',
    hl: opts?.hl || 'en'
  };

  const res = await axios.post(endpoint, payload, {
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    }
  });

  // Transform the data to match our expected format
  const results: SerperSearchResult[] = (res.data.organic || []).map((item: any) => ({
    title: item.title,
    url: item.link,
    snippet: item.snippet,
    position: item.position,
    content: item.snippet,
    // Add image properties for compatibility
    img_src: item.imageUrl || item.thumbnailUrl,
    thumbnail_src: item.thumbnailUrl,
    thumbnail: item.thumbnailUrl,
    author: item.source
  }));
  
  const suggestions: string[] = res.data.relatedSearches || [];

  return { results, suggestions };
};

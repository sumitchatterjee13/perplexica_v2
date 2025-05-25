import axios from 'axios';
import { getBraveApiKey } from './config';

interface BraveSearchOptions {
  count?: number;
  offset?: number;
  freshness?: string;
  country?: string;
  safesearch?: string;
}

interface BraveSearchResult {
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  age?: string;
  language?: string;
  content?: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  author?: string;
  iframe_src?: string;
}

export const searchBrave = async (
  query: string,
  opts?: BraveSearchOptions,
) => {
  const apiKey = getBraveApiKey();
  if (!apiKey) {
    throw new Error('Brave API key is not configured');
  }

  const endpoint = 'https://api.search.brave.com/res/v1/web/search';
  
  const params = {
    q: query,
    count: opts?.count || 10,
    offset: opts?.offset || 0,
    freshness: opts?.freshness,
    country: opts?.country,
    safesearch: opts?.safesearch,
  };

  const res = await axios.get(endpoint, {
    params,
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': apiKey
    }
  });

  // Convert Brave results to our standardized format
  const results: BraveSearchResult[] = (res.data.web?.results || []).map((item: any) => ({
    title: item.title,
    url: item.url,
    content: item.description,
    // Map image data when available
    img_src: item.thumbnail || item.image,
    thumbnail_src: item.thumbnail,
    thumbnail: item.thumbnail,
    author: item.source,
    description: item.description
  }));
  
  const suggestions: string[] = res.data.query?.suggestions || [];

  return { results, suggestions };
};

import { getSelectedSearchEngine } from './config';
import { searchSearxng } from './searxng';
import { searchBrave } from './brave';
import { searchSerper } from './serper';

// Re-export the searchHandlers for compatibility
export { searchHandlers } from './search/index';

export type SearchEngine = 'searxng' | 'brave' | 'serper';

export interface SearchOptions {
  limit?: number;
  offset?: number;
  language?: string;
  engines?: string[];
  categories?: string[];
  pageno?: number;
}

export interface SearchResult {
  title: string;
  url: string;
  content?: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  author?: string;
  iframe_src?: string;
}

export const search = async (query: string, opts?: SearchOptions) => {
  const selectedEngine = getSelectedSearchEngine() as SearchEngine;
  
  // Handle image search engines specially
  const isImageSearch = opts?.engines?.some(engine => 
    engine.includes('image') || engine.includes('bing image') || engine.includes('google image')
  );

  try {
    switch (selectedEngine) {
      case 'brave':
        const braveParams: any = {
          count: opts?.limit,
          offset: opts?.offset,
          // Brave doesn't use the language parameter directly in the same way
          // We use country instead which might be derived from language in a real implementation
          country: opts?.language?.split('-')[1]?.toLowerCase()
        };
        
        // For image search, modify the query to specify images
        const braveQuery = isImageSearch ? `${query} images` : query;
        
        const braveResults = await searchBrave(braveQuery, braveParams);
        return {
          results: braveResults.results,
          suggestions: braveResults.suggestions
        };
        
      case 'serper':
        const serperParams: any = {
          num: opts?.limit,
          page: opts?.offset ? Math.floor(opts.offset / (opts.limit || 10)) + 1 : 1
        };
        
        // For image search with Serper, we should use the image search endpoint or add image context
        const serperQuery = isImageSearch ? `${query} images` : query;
        
        const serperResults = await searchSerper(serperQuery, serperParams);
        return {
          results: serperResults.results,
          suggestions: serperResults.suggestions
        };
        
      case 'searxng':
      default:
        // SearxNG can directly use the engines parameter
        const searxngResults = await searchSearxng(query, {
          pageno: opts?.offset ? Math.floor(opts.offset / (opts.limit || 10)) + 1 : 1,
          language: opts?.language,
          engines: opts?.engines
        });
        return {
          results: searxngResults.results,
          suggestions: searxngResults.suggestions
        };
    }
  } catch (error) {
    console.error(`Error with ${selectedEngine} search:`, error);
    
    // If the selected engine fails, try SearxNG as fallback if it wasn't the original choice
    if (selectedEngine !== 'searxng') {
      console.log('Falling back to SearxNG');
      try {
        const fallbackResults = await searchSearxng(query, {
          pageno: opts?.offset ? Math.floor(opts.offset / (opts.limit || 10)) + 1 : 1,
          language: opts?.language,
          engines: opts?.engines
        });
        return {
          results: fallbackResults.results,
          suggestions: fallbackResults.suggestions
        };
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
};

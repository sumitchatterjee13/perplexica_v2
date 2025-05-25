// A type-safe wrapper for Next.js cookies API
import { cookies as nextCookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// Helper function to get cookie store and handle the Promise
const getCookieStore = async (): Promise<ReadonlyRequestCookies> => {
  return await nextCookies();
};

export const cookies = {
  get: async (name: string): Promise<ResponseCookie | undefined> => {
    try {
      const cookieStore = await getCookieStore();
      return cookieStore.get(name);
    } catch (error) {
      console.error(`Error getting cookie ${name}:`, error);
      return undefined;
    }
  },
  
  set: async (options: {
    name: string;
    value: string;
    httpOnly?: boolean;
    secure?: boolean;
    maxAge?: number;
    path?: string;
  }): Promise<void> => {
    try {
      const cookieStore = await getCookieStore();
      cookieStore.set(options);
    } catch (error) {
      console.error(`Error setting cookie ${options.name}:`, error);
    }
  },
  
  delete: async (name: string): Promise<void> => {
    try {
      const cookieStore = await getCookieStore();
      cookieStore.delete(name);
    } catch (error) {
      console.error(`Error deleting cookie ${name}:`, error);
    }
  }
};

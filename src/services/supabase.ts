import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// LocalStorage keys for optional runtime configuration by admin
export const STORAGE_SUPABASE_URL = 'aurora_supabase_url';
export const STORAGE_SUPABASE_KEY = 'aurora_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  let url = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_URL) : null) || envUrl || '';
  let anonKey = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_KEY) : null) || envAnonKey || '';

  // Clean trailing slashes
  url = url.trim().replace(/\/+$/, '');
  anonKey = anonKey.trim();

  // Valid if starts with https://
  const isConfigured = Boolean(
    url &&
    url.startsWith('https://') &&
    anonKey &&
    anonKey.length > 10 &&
    !url.includes('your-project-id')
  );

  return { url, anonKey, isConfigured };
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(STORAGE_SUPABASE_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_SUPABASE_URL);
    }

    if (anonKey.trim()) {
      localStorage.setItem(STORAGE_SUPABASE_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(STORAGE_SUPABASE_KEY);
    }

    cachedClient = null;
    lastUsedUrl = '';
    lastUsedKey = '';
  }
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables provided at build-time or runtime
const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) as string | undefined;
const envAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) as string | undefined;

// LocalStorage keys for optional runtime configuration by admin
export const STORAGE_SUPABASE_URL = 'aurora_supabase_url';
export const STORAGE_SUPABASE_KEY = 'aurora_supabase_anon_key';

/**
 * Normalizes Supabase Project URL:
 * - Trims whitespaces
 * - Strips trailing slashes
 * - Strips trailing /rest/v1 or /auth/v1 in case user copied the REST API URL from Supabase dashboard
 */
export function cleanSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/(rest|auth|storage)\/v\d+\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
}

// Default Supabase project configuration for Aurora Mom & Baby Spa
export const DEFAULT_SUPABASE_URL = 'https://gnwohbzwpkitupvncrjf.supabase.co';
export const DEFAULT_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud29oYnp3cGtpdHVwdm5jcmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5OTYxNjMsImV4cCI6MjEwNjU3MjE2M30.myg_jmiWxQbXyDCa0BK2M2Ak8YrPBLBHiIDJcIYwoI0';

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  let rawUrl =
    (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_URL) : null) ||
    envUrl ||
    DEFAULT_SUPABASE_URL;

  let anonKey =
    (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_KEY) : null) ||
    envAnonKey ||
    DEFAULT_SUPABASE_KEY;

  const url = cleanSupabaseUrl(rawUrl);
  anonKey = (anonKey || '').trim();

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
    const cleaned = cleanSupabaseUrl(url);
    if (cleaned) {
      localStorage.setItem(STORAGE_SUPABASE_URL, cleaned);
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

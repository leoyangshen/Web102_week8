// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// !! IMPORTANT !!
// Replace these with your actual Supabase Project URL and Anon Key
// You can find these in your Supabase project settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // e.g., https://abcdefghijk.supabase.co
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // e.g., eyJhbGciOiJIUzI1Ni...

// Check if the variables are loaded (good for debugging)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing! Please check your .env file.");
} else {
  console.log("Supabase URL loaded:", supabaseUrl);
  console.log("Supabase Anon Key loaded (partial):", supabaseAnonKey.substring(0, 10) + '...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/*
  Explanation:
  This file initializes the Supabase client.
  - `createClient` is imported from the Supabase JavaScript library.
  - `supabaseUrl` and `supabaseAnonKey` are now read from environment variables
    prefixed with `VITE_` (e.g., VITE_SUPABASE_URL) from your .env file.
  - The `supabase` object is then exported, making it available for use
    throughout your React application to interact with your Supabase backend.
*/

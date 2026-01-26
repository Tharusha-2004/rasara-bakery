import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to validate URL structure
const isValidUrl = (urlString) => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};

// Check if variables are present, not default placeholders, and URL is valid
const isUrlValid = supabaseUrl && 
  !supabaseUrl.includes('your_project_url') && 
  !supabaseUrl.includes('your_supabase_project_url') &&
  isValidUrl(supabaseUrl);

const isKeyValid = supabaseAnonKey && 
  !supabaseAnonKey.includes('your_anon_key') && 
  !supabaseAnonKey.includes('your_supabase_anon_key');

if (!isUrlValid || !isKeyValid) {
  console.warn(
    'Supabase environment variables are missing, invalid, or using placeholders.\n' +
    'Please check your .env file.\n' +
    'Required: VITE_SUPABASE_URL (must be a valid URL), VITE_SUPABASE_ANON_KEY'
  );
}

// Use fallbacks to prevent crash on initialization if variables are missing or invalid
// The application will load, but Supabase calls will fail until properly configured
const url = isUrlValid ? supabaseUrl : 'https://placeholder.supabase.co';
const key = isKeyValid ? supabaseAnonKey : 'placeholder-key';

export const supabase = createClient(url, key);
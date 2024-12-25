import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ptwwhlsewbmhwsvzdpww.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0d3dobHNld2JtaHdzdnpkcHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyMTM1MDQsImV4cCI6MjA0OTc4OTUwNH0.NmYbm0LbJ2uKrL7ImdQVFcN7GIhrh5Ivh-7QPsOkKGE";

if (!SUPABASE_URL) {
  console.error('Missing SUPABASE_URL');
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  console.error('Missing SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
);

// Добавляем слушатель для отладки состояния авторизации
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Изменение состояния аутентификации:', event);
  if (session) {
    console.log('Текущая сессия:', {
      user: session.user.id,
      email: session.user.email,
      role: session.user.role
    });
  }
});
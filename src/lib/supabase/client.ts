import { ENVIRONMENT } from '@/config/environment';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    ENVIRONMENT.supabaseUrl!,
    ENVIRONMENT.supabaseKey!,
  );
}

import { createClient } from '@supabase/supabase-js';
import { Database } from '../_shared/database.types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { email } = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    console.log('Checking if user exists:', email);

    const { data: user, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();

    if (getUserError) {
      throw getUserError;
    }

    const userExists = user.users.some(u => u.email?.toLowerCase() === email.toLowerCase());

    console.log('User exists:', userExists);

    return new Response(
      JSON.stringify(userExists),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
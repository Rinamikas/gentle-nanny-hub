import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { validateUserData } from './validation.ts'
import { 
  findExistingUser,
  createAuthUser,
  createUserProfile,
  createUserRole,
  deleteAuthUser
} from './user-service.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Валидируем входные данные
    const userData = validateUserData(await req.json());
    console.log("Validated user data:", userData);
    
    // Проверяем существование пользователя
    const existingUser = await findExistingUser(supabaseClient, userData.email);
    
    if (existingUser) {
      console.log("Found existing user:", existingUser.email);
      return new Response(
        JSON.stringify({ 
          id: existingUser.id,
          email: userData.email,
          exists: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    try {
      // Создаем пользователя в auth.users
      console.log("Creating new auth user...");
      const newUser = await createAuthUser(supabaseClient, userData);
      
      try {
        // Создаем профиль
        console.log("Creating user profile...");
        await createUserProfile(supabaseClient, newUser.id, userData);
        
        try {
          // Создаем роль
          console.log("Creating user role...");
          await createUserRole(supabaseClient, newUser.id);
          
          console.log("Successfully created new user:", {
            id: newUser.id,
            email: userData.email
          });

          return new Response(
            JSON.stringify({ 
              id: newUser.id,
              email: userData.email,
              exists: false
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        } catch (roleError) {
          console.error("Role creation error:", roleError);
          // Если не удалось создать роль, удаляем пользователя
          await deleteAuthUser(supabaseClient, newUser.id);
          throw new Error(`Failed to create user role: ${roleError.message}`);
        }
      } catch (profileError) {
        console.error("Profile creation error:", profileError);
        // Если не удалось создать профиль, удаляем пользователя
        await deleteAuthUser(supabaseClient, newUser.id);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }
    } catch (error) {
      console.error("User creation error:", {
        name: error.name,
        message: error.message,
        details: error.details
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to create user",
          details: error.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
  } catch (error) {
    console.error("Top level error:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: "Error processing request",
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 400
      }
    );
  }
})
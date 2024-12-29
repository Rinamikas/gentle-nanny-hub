import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { CreateUserData } from './validation.ts';

export async function findExistingUser(supabase: ReturnType<typeof createClient>, email: string) {
  console.log("Checking if user exists for email:", email);
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
    filter: {
      email: email.toLowerCase()
    }
  });
  
  if (listError) {
    console.error("Error getting users list:", listError);
    throw listError;
  }

  const existingUser = users?.find(
    user => user.email?.toLowerCase() === email.toLowerCase()
  );
  
  if (existingUser) {
    console.log("Found existing user with exact email match:", existingUser.email);
  } else {
    console.log("No user found with email:", email);
  }
  
  return existingUser;
}

export async function createAuthUser(supabase: ReturnType<typeof createClient>, userData: CreateUserData) {
  console.log("Creating auth user with data:", {
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone
  });
  
  try {
    // Генерируем случайный пароль
    const password = Math.random().toString(36).slice(-8);
    
    console.log("Attempting to create user with admin API...");
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: userData.email.toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone
      }
    });

    if (createError) {
      console.error("Auth user creation error:", createError);
      throw createError;
    }

    if (!data?.user) {
      console.error("User creation failed - no data returned");
      throw new Error("User creation failed - no data returned");
    }

    console.log("Auth user created successfully:", data.user.id);
    return data.user;
  } catch (error) {
    console.error("Failed to create auth user:", error);
    throw error;
  }
}
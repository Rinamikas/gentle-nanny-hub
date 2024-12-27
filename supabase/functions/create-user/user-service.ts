import { SupabaseClient } from '@supabase/supabase-js';
import { CreateUserData } from './validation';

export async function findExistingUser(supabase: SupabaseClient, email: string) {
  console.log("Checking if user exists for email:", email);
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error getting users list:", listError);
    throw listError;
  }
  
  return users.find(user => user.email?.toLowerCase() === email);
}

export async function createAuthUser(supabase: SupabaseClient, userData: CreateUserData) {
  console.log("Creating auth user for:", userData.email);
  
  const password = Math.random().toString(36).slice(-8);
  
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password,
    email_confirm: true,
    user_metadata: { 
      first_name: userData.firstName, 
      last_name: userData.lastName,
      phone: userData.phone,
      email_verified: true
    }
  });

  if (createError) {
    console.error("Auth user creation error:", createError);
    throw createError;
  }

  if (!newUser?.user) {
    throw new Error("User creation failed - no data returned");
  }

  return newUser.user;
}

export async function createUserProfile(supabase: SupabaseClient, userId: string, userData: CreateUserData) {
  console.log("Creating user profile for:", userId);
  
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      first_name: userData.firstName,
      last_name: userData.lastName,
      main_phone: userData.phone
    });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    throw profileError;
  }
}

export async function createUserRole(supabase: SupabaseClient, userId: string) {
  console.log("Creating parent role for:", userId);
  
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: 'parent'
    });

  if (roleError) {
    console.error("Role creation error:", roleError);
    throw roleError;
  }
}

export async function deleteAuthUser(supabase: SupabaseClient, userId: string) {
  console.log("Deleting auth user:", userId);
  
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  
  if (deleteError) {
    console.error("Failed to delete user:", deleteError);
    throw deleteError;
  }
}
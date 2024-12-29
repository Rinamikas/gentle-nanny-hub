import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { CreateUserData } from './validation.ts';

export async function createAuthUser(supabase: ReturnType<typeof createClient>, userData: CreateUserData) {
  console.log("Creating auth user for:", userData.email);
  
  try {
    const password = Math.random().toString(36).slice(-8);
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: userData.email.toLowerCase(),
      password,
      email_confirm: true,
      phone: userData.phone,
      user_metadata: { 
        first_name: userData.firstName, 
        last_name: userData.lastName,
        phone: userData.phone,
        birth_date: userData.birth_date,
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

    console.log("Auth user created successfully:", newUser.user.id);
    return newUser.user;
  } catch (error) {
    console.error("Failed to create auth user:", error);
    throw error;
  }
}

export async function createUserProfile(supabase: ReturnType<typeof createClient>, userId: string, userData: CreateUserData) {
  console.log("Creating user profile for:", userId);
  
  try {
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
    
    console.log("User profile created successfully");
  } catch (error) {
    console.error("Failed to create user profile:", error);
    throw error;
  }
}

export async function createUserRole(supabase: ReturnType<typeof createClient>, userId: string) {
  console.log("Creating parent role for:", userId);
  
  try {
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
    
    console.log("User role created successfully");
  } catch (error) {
    console.error("Failed to create user role:", error);
    throw error;
  }
}

export async function deleteAuthUser(supabase: ReturnType<typeof createClient>, userId: string) {
  console.log("Deleting auth user:", userId);
  
  try {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error("Failed to delete user:", deleteError);
      throw deleteError;
    }
    
    console.log("Auth user deleted successfully");
  } catch (error) {
    console.error("Failed to delete auth user:", error);
    throw error;
  }
}
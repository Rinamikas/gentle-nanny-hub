import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";
import NannyForm from "../nannies/components/NannyForm";
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import ParentForm from "./components/ParentForm";
import { toast } from "@/hooks/use-toast";
import type { Profile } from "./types";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { session } = useSessionContext();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      console.log("Начинаем загрузку профиля...");
      
      if (!session) {
        console.log("Сессия не найдена в queryFn");
        throw new Error("Не авторизован");
      }

      console.log("ID пользователя:", session.user.id);

      // Получаем базовый профиль с ролями
      let { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles (
            id,
            role,
            created_at,
            user_id
          )
        `)
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Ошибка при загрузке профиля:", profileError);
        
        // Если профиль не найден, создаем новый
        if (profileError.code === 'PGRST116') {
          console.log("Профиль не найден, создаем новый");
          
          // Сначала создаем профиль
          const { data: newProfile, error: createProfileError } = await supabase
            .from("profiles")
            .insert([{ 
              id: session.user.id,
              email: session.user.email
            }])
            .select()
            .single();

          if (createProfileError) {
            console.error("Ошибка при создании профиля:", createProfileError);
            throw createProfileError;
          }

          // Затем создаем роль parent по умолчанию
          const { error: createRoleError } = await supabase
            .from("user_roles")
            .insert([{
              user_id: session.user.id,
              role: 'parent'
            }]);

          if (createRoleError) {
            console.error("Ошибка при создании роли:", createRoleError);
            throw createRoleError;
          }

          // Получаем обновленный профиль с ролью
          const { data: updatedProfile, error: fetchError } = await supabase
            .from("profiles")
            .select(`
              *,
              user_roles (
                id,
                role,
                created_at,
                user_id
              )
            `)
            .eq("id", session.user.id)
            .single();

          if (fetchError) {
            console.error("Ошибка при получении обновленного профиля:", fetchError);
            throw fetchError;
          }

          profileData = updatedProfile;
        } else {
          throw profileError;
        }
      }

      console.log("Загружен профиль:", profileData);
      
      // Преобразуем данные в правильный формат
      const profile: Profile = {
        ...profileData,
        user_roles: Array.isArray(profileData.user_roles) 
          ? profileData.user_roles 
          : profileData.user_roles ? [profileData.user_roles] : []
      };

      return profile;
    },
    meta: {
      onError: (error: any) => {
        console.error("Ошибка при загрузке данных профиля:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные профиля",
        });
      }
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="container mx-auto py-6">
      <ProfileHeader profile={profile} />
      <div className="mt-8">
        <ProfileForm profile={profile} onUpdate={refetch} />
      </div>

      {profile?.user_roles?.[0]?.role === "nanny" && profile.nanny_profiles?.[0] && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Анкета няни</h2>
          <NannyForm />
        </div>
      )}

      {profile?.user_roles?.[0]?.role === "parent" && profile.parent_profiles?.[0] && (
        <div className="mt-8">
          <ParentForm 
            profile={profile.parent_profiles[0]} 
            onUpdate={refetch}
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
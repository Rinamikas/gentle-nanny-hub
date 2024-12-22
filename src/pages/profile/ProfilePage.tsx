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
        .select("*, user_roles(*)")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Ошибка при загрузке профиля:", profileError);
        
        // Если профиль не найден, создаем новый
        if (profileError.code === 'PGRST116') {
          console.log("Профиль не найден, создаем новый");
          
          // Создаем новый профиль
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([
              { 
                id: session.user.id,
                email: session.user.email
              }
            ])
            .select("*, user_roles(*)")
            .single();

          if (createError) {
            console.error("Ошибка при создании профиля:", createError);
            throw createError;
          }

          profileData = newProfile;
        } else {
          throw profileError;
        }
      }

      console.log("Загружен профиль:", profileData);

      // Получаем данные няни
      const { data: nannyData, error: nannyError } = await supabase
        .from("nanny_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (nannyError && nannyError.code !== 'PGRST116') {
        console.error("Ошибка при загрузке профиля няни:", nannyError);
      }

      // Получаем данные родителя
      const { data: parentData, error: parentError } = await supabase
        .from("parent_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (parentError && parentError.code !== 'PGRST116') {
        console.error("Ошибка при загрузке профиля родителя:", parentError);
      }

      const formattedData: Profile = {
        ...profileData,
        user_roles: Array.isArray(profileData.user_roles) 
          ? profileData.user_roles 
          : profileData.user_roles ? [profileData.user_roles] : [],
        nanny_profiles: nannyData ? [nannyData] : [],
        parent_profiles: parentData ? [parentData] : [],
      };

      console.log("Форматированные данные профиля:", formattedData);
      return formattedData;
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
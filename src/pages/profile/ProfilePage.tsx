import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";
import NannyForm from "../nannies/components/NannyForm";
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
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

      // Получаем базовый профиль
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Ошибка при загрузке профиля:", profileError);
        throw profileError;
      }

      // Используем email из сессии вместо профиля
      profileData.email = session.user.email;

      console.log("Загружен профиль:", profileData);

      // Получаем роли пользователя
      const { data: rolesData, error: rolesError } = await supabase
        .rpc('get_user_roles');

      if (rolesError) {
        console.error("Ошибка при загрузке ролей:", rolesError);
        throw rolesError;
      }

      // Фильтруем роли для текущего пользователя
      const userRoles = rolesData.filter(role => role.user_id === session.user.id);
      console.log("Роли пользователя:", userRoles);

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
        user_roles: userRoles.map(({ role }) => ({ role })),
        nanny_profiles: nannyData ? [nannyData] : [],
        parent_profiles: parentData ? [parentData] : [],
      };

      console.log("Форматированные данные профиля:", formattedData);
      return formattedData;
    },
  });

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
          <h2 className="text-lg font-semibold mb-4">Анкета родителя</h2>
          {/* TODO: Добавить форму родителя */}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
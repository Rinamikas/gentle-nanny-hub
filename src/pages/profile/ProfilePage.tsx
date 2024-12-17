import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LoadingScreen from "@/components/LoadingScreen";
import NannyForm from "../nannies/components/NannyForm";
import ProfileHeader from "./components/ProfileHeader";
import ContactInfo from "./components/ContactInfo";
import type { Profile } from "./types";

const ProfilePage = () => {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      console.log("Начинаем загрузку профиля...");
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Ошибка при получении сессии:", sessionError);
        throw sessionError;
      }

      if (!session) {
        console.log("Сессия не найдена, перенаправляем на /auth");
        navigate("/auth");
        throw new Error("Не авторизован");
      }

      console.log("ID пользователя:", session.user.id);

      // Сначала получаем базовый профиль
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Ошибка при загрузке профиля:", profileError);
        throw profileError;
      }

      // Затем получаем данные няни, если они есть
      const { data: nannyData } = await supabase
        .from("nanny_profiles")
        .select("*")
        .eq("user_id", session.user.id);

      // И данные родителя, если они есть
      const { data: parentData } = await supabase
        .from("parent_profiles")
        .select("*")
        .eq("user_id", session.user.id);

      const formattedData: Profile = {
        ...profileData,
        nanny_profiles: nannyData,
        parent_profiles: parentData,
      };

      console.log("Загруженные данные профиля:", formattedData);
      return formattedData;
    },
  });

  if (isLoading || !profile) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto py-6">
      <ProfileHeader profile={profile} />
      <ContactInfo email={profile.email} phone={profile.phone} />

      {profile?.user_roles?.[0]?.role === "nanny" && profile.nanny_profiles?.[0] && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Анкета няни</h2>
          <NannyForm nannyId={profile.nanny_profiles[0].id} />
        </div>
      )}

      {profile?.user_roles?.[0]?.role === "parent" && profile.parent_profiles?.[0] && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Анкета родителя</h2>
          {/* TODO: Добавить форму родителя */}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
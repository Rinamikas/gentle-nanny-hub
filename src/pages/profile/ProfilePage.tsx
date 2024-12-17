import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import NannyForm from "../nannies/components/NannyForm";

interface NannyProfile {
  id: string;
  user_id: string | null;
  experience_years: number | null;
  education: string | null;
  hourly_rate: number | null;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  position: string | null;
  age_group: string | null;
  camera_phone: string | null;
  camera_number: string | null;
  address: string | null;
  relative_phone: string | null;
  specializations: string[] | null;
  certifications: string[] | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean | null;
  deleted_at: string | null;
}

interface ParentProfile {
  id: string;
  user_id: string | null;
  children_count: number | null;
  address: string | null;
  special_requirements: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role: "nanny" | "owner" | "admin" | "parent";
}

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  user_roles: UserRole[];
  nanny_profiles: NannyProfile[] | null;
  parent_profiles: ParentProfile[] | null;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      console.log("Начинаем загрузку профиля...");
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Ошибка получения сессии:", sessionError);
        throw new Error("Ошибка аутентификации");
      }

      if (!session?.user?.id) {
        console.error("Нет активной сессии");
        navigate("/auth");
        throw new Error("Пользователь не аутентифицирован");
      }

      console.log("ID пользователя:", session.user.id);

      // Сначала загружаем базовый профиль
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles (role),
          nanny_profiles (*),
          parent_profiles (*)
        `)
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Ошибка загрузки профиля:", profileError);
        throw profileError;
      }

      console.log("Профиль загружен:", profileData);
      
      // Преобразуем данные в правильный формат
      const formattedData: Profile = {
        ...profileData,
        nanny_profiles: profileData.nanny_profiles ? [profileData.nanny_profiles] : null,
        parent_profiles: profileData.parent_profiles ? [profileData.parent_profiles] : null,
        user_roles: profileData.user_roles || []
      };

      return formattedData;
    },
    retry: 1,
  });

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!profile?.id) {
        throw new Error("Профиль не найден");
      }

      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Необходимо выбрать файл для загрузки");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}/avatar.${fileExt}`;

      console.log("Uploading photo:", filePath);

      const { error: uploadError } = await supabase.storage
        .from("nanny_files")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("nanny_files")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ photo_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Успешно",
        description: "Фотография профиля обновлена",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить фотографию",
      });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!profile) {
    return <div>Профиль не найден</div>;
  }

  const userRole = profile.user_roles?.[0]?.role;
  const isNanny = userRole === "nanny";
  const isParent = userRole === "parent";

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 flex items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.photo_url || ""} />
            <AvatarFallback>
              {profile?.first_name?.[0]}
              {profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full"
            onClick={() => document.getElementById("photo-upload")?.click()}
            disabled={uploading}
          >
            <Camera className="h-4 w-4" />
          </Button>
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            className="hidden"
            onChange={uploadPhoto}
            disabled={uploading}
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-muted-foreground">
            {profile?.user_roles?.[0]?.role && (
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm mr-2">
                {profile.user_roles[0].role}
              </span>
            )}
            Создан: {profile?.created_at && format(new Date(profile.created_at), "dd MMMM yyyy", { locale: ru })}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold">Контактная информация</h2>
          <div className="grid gap-2">
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Телефон:</strong> {profile?.phone}</p>
          </div>
        </div>

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
    </div>
  );
}
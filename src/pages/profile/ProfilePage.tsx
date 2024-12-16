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
import { User } from "../users/types";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Ошибка аутентификации");
      }

      if (!session?.user?.id) {
        console.error("No active session");
        throw new Error("Пользователь не аутентифицирован");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles (
            role
          ),
          nanny_profiles (
            *
          ),
          parent_profiles (
            *
          )
        `)
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      return profileData;
    },
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
            <AvatarImage src={profile.photo_url || ""} />
            <AvatarFallback>
              {profile.first_name?.[0]}
              {profile.last_name?.[0]}
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
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-muted-foreground">
            {userRole && (
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm mr-2">
                {userRole}
              </span>
            )}
            Создан: {format(new Date(profile.created_at), "dd MMMM yyyy", { locale: ru })}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold">Контактная информация</h2>
          <div className="grid gap-2">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Телефон:</strong> {profile.phone}</p>
          </div>
        </div>

        {isNanny && profile.nanny_profiles?.[0] && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Анкета няни</h2>
            <NannyForm nannyId={profile.nanny_profiles[0].id} />
          </div>
        )}

        {isParent && profile.parent_profiles?.[0] && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Анкета родителя</h2>
            {/* TODO: Добавить форму родителя */}
          </div>
        )}
      </div>
    </div>
  );
}
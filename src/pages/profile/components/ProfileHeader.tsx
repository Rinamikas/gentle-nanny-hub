import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "../types";

interface ProfileHeaderProps {
  profile: Profile;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Вы должны выбрать изображение для загрузки.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${Math.random()}.${fileExt}`;

      setUploading(true);

      // Загружаем файл в storage
      const { error: uploadError } = await supabase.storage
        .from("nanny_files")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Получаем публичную ссылку на загруженный файл
      const { data } = await supabase.storage
        .from("nanny_files")
        .getPublicUrl(filePath);

      // Обновляем профиль с новой ссылкой на фото
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ photo_url: data.publicUrl })
        .eq("id", profile?.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Успешно",
        description: "Фото профиля обновлено",
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла ошибка при загрузке фото",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
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
          disabled={uploading}
        >
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
            {uploading ? "..." : "📷"}
          </label>
        </Button>
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
  );
};

export default ProfileHeader;
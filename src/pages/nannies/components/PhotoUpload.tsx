import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  onUpload: (url: string) => void;
  currentPhotoUrl?: string;
}

export default function PhotoUpload({ onUpload, currentPhotoUrl }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Необходимо выбрать файл для загрузки');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `photos/${Math.random()}.${fileExt}`;

      console.log('Uploading photo:', filePath);

      const { error: uploadError, data } = await supabase.storage
        .from('nanny_files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      console.log('Photo uploaded successfully');

      const { data: { publicUrl } } = supabase.storage
        .from('nanny_files')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      toast({
        title: "Успешно",
        description: "Фотография загружена",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить фотографию",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {currentPhotoUrl && (
        <img 
          src={currentPhotoUrl} 
          alt="Фото няни" 
          className="w-32 h-32 object-cover rounded-full"
        />
      )}
      <div>
        <Button
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById('photo')?.click()}
        >
          {uploading ? 'Загрузка...' : 'Загрузить фото'}
        </Button>
        <input
          type="file"
          id="photo"
          accept="image/*"
          onChange={uploadPhoto}
          className="hidden"
        />
      </div>
    </div>
  );
}
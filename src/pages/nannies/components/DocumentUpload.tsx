import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  onUpload: (url: string) => void;
  currentFileUrl?: string;
  type: "criminal_record" | "image_usage_consent" | "medical_book" | "personal_data_consent";
}

export default function DocumentUpload({ onUpload, currentFileUrl, type }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Необходимо выбрать файл для загрузки');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${type}/${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('nanny_files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('nanny_files')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      toast({
        title: "Успешно",
        description: "Документ загружен",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить документ",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      {currentFileUrl && (
        <a 
          href={currentFileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Просмотреть текущий документ
        </a>
      )}
      <div>
        <Button
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById(`document-${type}`)?.click()}
        >
          {uploading ? 'Загрузка...' : 'Загрузить документ'}
        </Button>
        <input
          type="file"
          id={`document-${type}`}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={uploadDocument}
          className="hidden"
        />
      </div>
    </div>
  );
}
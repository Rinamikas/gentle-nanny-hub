import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailFormProps {
  onEmailSubmit: (email: string) => void;
}

const EmailForm = ({ onEmailSubmit }: EmailFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Начинаем процесс отправки кода для:", email);
    
    try {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 30 * 60000); // 30 минут

      // Сначала проверяем существующие коды
      console.log("Проверяем существующие коды для:", email);
      const { data: existingCodes, error: checkError } = await supabase
        .from('verification_codes')
        .select('id')
        .eq('email', email);

      if (checkError) {
        console.error("Ошибка при проверке существующих кодов:", checkError);
      } else {
        console.log("Найдено существующих кодов:", existingCodes?.length);
        
        // Если есть существующие коды, пытаемся их удалить
        if (existingCodes && existingCodes.length > 0) {
          console.log("Удаляем старые коды для:", email);
          const { error: deleteError } = await supabase
            .from('verification_codes')
            .delete()
            .eq('email', email);

          if (deleteError) {
            console.error("Ошибка при удалении старых кодов:", deleteError);
          } else {
            console.log("Старые коды успешно удалены");
          }
        }
      }

      // Сохраняем новый код в базе данных
      console.log("Сохраняем новый код верификации");
      const { error: insertError } = await supabase
        .from('verification_codes')
        .insert({
          email,
          code: verificationCode,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error("Ошибка при сохранении кода:", insertError);
        throw insertError;
      }

      // Отправляем email через Edge Function
      console.log("Отправляем код на email");
      const { error: sendError } = await supabase.functions.invoke('send-verification-email', {
        body: { to: email, code: verificationCode }
      });

      if (sendError) {
        console.error("Ошибка при отправке email:", sendError);
        throw sendError;
      }

      console.log("Код успешно создан и отправлен");
      toast({
        title: "Код подтверждения отправлен",
        description: "Пожалуйста, проверьте вашу почту",
      });
      
      onEmailSubmit(email);
    } catch (error: any) {
      console.error('Ошибка отправки кода:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить код подтверждения",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Введите email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Отправка..." : "Отправить код"}
      </Button>
    </form>
  );
};

export default EmailForm;
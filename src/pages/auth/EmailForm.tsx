import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface EmailFormProps {
  onEmailSubmit: (email: string) => void;
}

export const EmailForm = ({ onEmailSubmit }: EmailFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Начало процесса отправки кода подтверждения");

    try {
      // Генерация 6-значного кода
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      console.log("Проверка существующих кодов для:", email);
      
      // Проверка существующих кодов
      const { data: existingCodes, error: checkError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('status', 'pending');

      if (checkError) {
        console.error("Ошибка при проверке существующих кодов:", checkError);
        throw new Error("Ошибка при проверке существующих кодов");
      }

      console.log("Найдено существующих кодов:", existingCodes?.length);

      // Если есть существующие коды, удаляем их
      if (existingCodes && existingCodes.length > 0) {
        console.log("Удаление старых кодов для:", email);
        
        const { error: deleteError } = await supabase
          .from('verification_codes')
          .delete()
          .eq('email', email)
          .eq('status', 'pending');

        if (deleteError) {
          console.error("Ошибка при удалении старых кодов:", deleteError);
          throw new Error("Ошибка при удалении старых кодов");
        }
      }

      // Сохранение нового кода
      console.log("Сохранение нового кода для:", email);
      const { error: insertError } = await supabase
        .from('verification_codes')
        .insert({
          email,
          code: verificationCode,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        });

      if (insertError) {
        console.error("Ошибка при сохранении кода:", insertError);
        throw new Error("Ошибка при сохранении кода");
      }

      console.log("Код успешно сохранен, отправка через edge function");
      
      // Отправляем код через нашу edge function
      const { error: sendError } = await supabase.functions.invoke('send-verification-email', {
        body: { 
          to: email,
          code: verificationCode
        }
      });

      if (sendError) {
        console.error("Ошибка при отправке кода:", sendError);
        // Проверяем, является ли ошибка превышением лимита
        if (sendError.message?.includes('429') || sendError.message?.includes('rate_limit')) {
          throw new Error("Пожалуйста, подождите 50 секунд перед повторной отправкой кода");
        }
        throw new Error("Ошибка при отправке кода");
      }

      // Создаем сессию через OTP без отправки email
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            verification_code: verificationCode
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (signInError) {
        console.error("Ошибка при создании сессии:", signInError);
        // Проверяем, является ли ошибка превышением лимита
        if (signInError.message?.includes('429') || signInError.message?.includes('rate_limit')) {
          throw new Error("Пожалуйста, подождите 50 секунд перед повторной отправкой кода");
        }
        throw new Error("Ошибка при создании сессии");
      }

      toast({
        title: "Код отправлен",
        description: "Проверьте вашу электронную почту",
      });

      onEmailSubmit(email);

    } catch (error) {
      console.error("Ошибка в процессе отправки кода:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла ошибка при отправке кода",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Введите email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Отправка..." : "Отправить код"}
      </Button>
    </form>
  );
};
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

      // Создаем сессию через OTP
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            verification_code: verificationCode
          }
        }
      });

      if (signInError) {
        console.error("Ошибка при создании сессии:", signInError);
        if (signInError.message?.includes('429') || signInError.message?.includes('rate_limit')) {
          throw new Error("Пожалуйста, подождите перед повторной отправкой кода");
        }
        throw signInError;
      }

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
        throw new Error("Ошибка при отправке кода");
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
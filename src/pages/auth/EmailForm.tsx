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
  const [retryCount, setRetryCount] = useState(0);
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

      // Создаем сессию через OTP с повторными попытками
      const maxRetries = 3;
      let signInError = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Попытка ${attempt} создания OTP сессии для ${email}`);
          
          // Проверяем, не превышен ли лимит попыток
          if (retryCount >= maxRetries) {
            throw new Error("Превышено количество попыток. Пожалуйста, подождите несколько минут");
          }

          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: true,
              data: {
                verification_code: verificationCode
              }
            }
          });

          if (!error) {
            signInError = null;
            break;
          }

          signInError = error;
          
          // Проверяем специфические ошибки
          if (error.message?.includes('429') || error.message?.includes('rate_limit')) {
            throw new Error("Слишком много попыток. Пожалуйста, подождите несколько минут");
          }

          if (error.message?.includes('Load failed')) {
            console.log(`Ошибка загрузки на попытке ${attempt}, пробуем снова через ${attempt} секунд`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }

          setRetryCount(prev => prev + 1);
          
          // Увеличиваем задержку с каждой попыткой
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } catch (e: any) {
          console.error(`Попытка ${attempt} не удалась:`, e);
          
          if (e.message?.includes('rate_limit') || e.message?.includes('попыток')) {
            throw e;
          }
          
          signInError = e;
        }
      }

      if (signInError) {
        console.error("Все попытки создания OTP сессии не удались:", signInError);
        throw new Error("Не удалось отправить код подтверждения. Пожалуйста, попробуйте позже");
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
      
      // Отправляем код через edge function
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

      setRetryCount(0);
      onEmailSubmit(email);

    } catch (error: any) {
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
      <Button type="submit" disabled={isLoading || retryCount >= 3}>
        {isLoading ? "Отправка..." : "Отправить код"}
      </Button>
    </form>
  );
};
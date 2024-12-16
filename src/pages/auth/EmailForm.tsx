import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface EmailFormProps {
  onEmailSubmit: (email: string) => void;
}

export const EmailForm = ({ onEmailSubmit }: EmailFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  // Функция для выполнения запроса с повторными попытками
  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Попытка ${attempt} из ${maxRetries}`);
        const result = await operation();
        return result;
      } catch (err: any) {
        console.error(`Ошибка на попытке ${attempt}:`, err);
        lastError = err;
        
        // Проверяем специфические ошибки, которые не нужно повторять
        if (err.status === 429 || (err.error && err.error.status === 429)) {
          throw err;
        }

        // Если это последняя попытка, пробрасываем ошибку
        if (attempt === maxRetries) {
          break;
        }

        // Экспоненциальная задержка между попытками
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.log(`Ждем ${delay}мс перед следующей попыткой`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Если все попытки исчерпаны, проверяем тип последней ошибки
    if (lastError?.message === "Load failed") {
      throw new Error("Не удалось установить соединение с сервером. Пожалуйста, проверьте подключение к интернету и попробуйте снова.");
    }
    throw lastError;
  };

  const extractWaitTime = (error: any): number => {
    try {
      let errorBody;
      if (error.body) {
        errorBody = JSON.parse(error.body);
      }
      
      if (errorBody?.message) {
        const match = errorBody.message.match(/\d+/);
        if (match) {
          return parseInt(match[0]);
        }
      }
    } catch (e) {
      console.error('Ошибка при парсинге тела ошибки:', e);
    }
    return 60;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || cooldown > 0) {
      return;
    }
    
    setIsLoading(true);
    console.log("Начало процесса отправки кода подтверждения");

    try {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      console.log(`Попытка создания OTP сессии для ${email}`);

      const { error: signInError } = await retryOperation(async () => {
        return await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            data: {
              verification_code: verificationCode
            }
          }
        });
      });

      if (signInError) {
        if (signInError.status === 429) {
          const waitTime = extractWaitTime(signInError);
          setCooldown(waitTime);
          throw new Error(`Пожалуйста, подождите ${waitTime} секунд перед повторной попыткой`);
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
      
      const { error: sendError } = await retryOperation(async () => {
        return await supabase.functions.invoke('send-verification-email', {
          body: { 
            to: email,
            code: verificationCode
          }
        });
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
      <Button 
        type="submit" 
        disabled={isLoading || cooldown > 0}
        className="w-full"
      >
        {cooldown > 0 
          ? `Подождите ${cooldown} сек.` 
          : isLoading 
            ? "Отправка..." 
            : "Отправить код"
        }
      </Button>
    </form>
  );
};
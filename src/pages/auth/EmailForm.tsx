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
    return 60; // Возвращаем значение по умолчанию, если не удалось извлечь время
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

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          data: {
            verification_code: verificationCode
          }
        }
      });

      if (signInError) {
        // Проверяем, является ли ошибка ограничением частоты запросов
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
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

  // Загружаем сохраненный email при монтировании компонента
  useEffect(() => {
    const savedEmail = localStorage.getItem('lastUsedEmail');
    if (savedEmail) {
      console.log("Загружен сохраненный email:", savedEmail);
      setEmail(savedEmail);
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || cooldown > 0) {
      return;
    }
    
    setIsLoading(true);
    console.log("=== Начало процесса отправки кода подтверждения ===");
    console.log("Email:", email);

    try {
      // Сохраняем email в localStorage
      localStorage.setItem('lastUsedEmail', email);
      console.log("Email сохранен в localStorage");

      // Генерируем код верификации
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      console.log("1. Проверяем существующие коды для email");
      const { data: existingCodes, error: checkError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('status', 'pending');

      if (checkError) {
        console.error("Ошибка при проверке существующих кодов:", checkError);
        throw new Error("Не удалось проверить существующие коды");
      }

      if (existingCodes && existingCodes.length > 0) {
        console.log("2. Найдены существующие коды, обновляем их статус");
        const { error: updateError } = await supabase
          .from('verification_codes')
          .update({ status: 'expired' })
          .eq('email', email)
          .eq('status', 'pending');

        if (updateError) {
          console.error("Ошибка при обновлении старых кодов:", updateError);
          throw new Error("Не удалось обновить старые коды");
        }
      }

      console.log("3. Сохранение нового кода верификации");
      const { error: insertError } = await supabase
        .from('verification_codes')
        .insert({
          email,
          code: verificationCode,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        });

      if (insertError) {
        console.error("4. Ошибка при сохранении кода:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details
        });
        throw new Error("Не удалось сохранить код верификации");
      }

      console.log("5. Отправка письма через Resend API");
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'send-verification-email',
        {
          body: JSON.stringify({
            to: [email],
            code: verificationCode
          })
        }
      );

      if (functionError) {
        console.error("6. Ошибка при отправке письма:", functionError);
        
        // Помечаем код как failed если не удалось отправить письмо
        await supabase
          .from('verification_codes')
          .update({ status: 'failed' })
          .eq('email', email)
          .eq('code', verificationCode);
          
        throw new Error("Не удалось отправить письмо с кодом");
      }

      console.log("7. Код успешно сохранен и отправлен");
      toast({
        title: "Код отправлен",
        description: "Проверьте вашу электронную почту",
      });

      onEmailSubmit(email);
      setCooldown(60);

    } catch (error: any) {
      console.error("=== Ошибка в процессе отправки кода ===");
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        status: error.status,
        stack: error.stack
      });
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Произошла ошибка при отправке кода",
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
          className="w-full"
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

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || cooldown > 0) {
      return;
    }
    
    setIsLoading(true);
    console.log("Начало процесса отправки кода подтверждения для:", email);

    try {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      console.log("Сохранение нового кода верификации");
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
        throw new Error("Не удалось сохранить код верификации");
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
        throw new Error("Не удалось отправить код");
      }

      console.log("Код успешно отправлен");
      toast({
        title: "Код отправлен",
        description: "Проверьте вашу электронную почту",
      });

      onEmailSubmit(email);
      setCooldown(60); // Устанавливаем 60-секундный кулдаун

    } catch (error: any) {
      console.error("Ошибка в процессе отправки кода:", error);
      
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
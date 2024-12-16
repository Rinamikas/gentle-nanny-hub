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
    console.log("=== Начало процесса отправки кода подтверждения ===");
    console.log("Email:", email);
    console.log("Origin URL:", window.location.origin);

    try {
      // Сначала отправляем OTP через Supabase Auth
      console.log("1. Отправка OTP через Supabase Auth");
      const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            email
          }
        }
      });

      console.log("OTP Response:", { data: otpData, error: otpError });

      if (otpError) {
        console.error("Ошибка при отправке OTP:", {
          message: otpError.message,
          status: otpError.status,
          name: otpError.name
        });
        throw otpError;
      }

      // После успешной отправки OTP сохраняем код в базу
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      console.log("2. Сохранение кода верификации в базу");
      const { error: insertError } = await supabase
        .from('verification_codes')
        .insert({
          email,
          code: verificationCode,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        });

      if (insertError) {
        console.error("Ошибка при сохранении кода:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details
        });
        throw new Error("Не удалось сохранить код верификации");
      }

      console.log("3. Код успешно сохранен и отправлен");
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
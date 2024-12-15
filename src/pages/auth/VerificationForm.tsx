import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
}

const VerificationForm = ({ email, onVerificationSuccess }: VerificationFormProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = async (value: string) => {
    if (value.length !== 6) return;
    
    setIsLoading(true);
    
    try {
      // Проверяем код в базе данных
      const { data: codes, error: selectError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', value)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (selectError) throw selectError;

      if (!codes || codes.length === 0) {
        throw new Error('Неверный или просроченный код подтверждения');
      }

      // Обновляем статус кода
      const { error: updateError } = await supabase
        .from('verification_codes')
        .update({ status: 'verified' })
        .eq('id', codes[0].id);

      if (updateError) throw updateError;

      // Создаем сессию для пользователя
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (signInError) throw signInError;

      toast({
        title: "Успешная авторизация",
        description: "Добро пожаловать в систему",
      });
      
      onVerificationSuccess();
    } catch (error: any) {
      console.error('Error verifying code:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Неверный код подтверждения",
        variant: "destructive",
      });
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Код подтверждения отправлен на {email}
        </p>
        <div className="flex justify-center">
          <InputOTP
            value={code}
            onChange={setCode}
            maxLength={6}
            onComplete={handleVerification}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} index={index} />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
      </div>
      <Button
        onClick={() => handleVerification(code)}
        className="w-full"
        disabled={code.length !== 6 || isLoading}
      >
        {isLoading ? "Проверка..." : "Подтвердить"}
      </Button>
    </div>
  );
};

export default VerificationForm;
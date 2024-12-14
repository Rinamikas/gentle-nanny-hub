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
    setIsLoading(true);
    
    try {
      const response = await supabase.functions.invoke('verify-email', {
        body: { email, code: value }
      });

      if (response.error) throw response.error;

      toast({
        title: "Успешная авторизация",
        description: "Добро пожаловать в систему",
      });
      
      onVerificationSuccess();
    } catch (error: any) {
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
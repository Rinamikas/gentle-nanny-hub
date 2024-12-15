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

      const { error: updateError } = await supabase
        .from('verification_codes')
        .update({ status: 'verified' })
        .eq('id', codes[0].id);

      if (updateError) throw updateError;

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
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Код подтверждения отправлен на {email}
        </p>
        <div className="flex flex-col items-center space-y-4">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => {
              console.log("OTP value changed:", value);
              setCode(value);
            }}
            onComplete={handleVerification}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot key={index} index={index} className="w-10 h-12 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
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
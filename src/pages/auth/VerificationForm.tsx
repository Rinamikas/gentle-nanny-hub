import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface VerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const VerificationForm = ({ email, onVerificationSuccess, onBack }: VerificationFormProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const firstInput = document.querySelector('input[id^="otp-"]') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  useEffect(() => {
    if (otp.length === 6) {
      handleVerification();
    }
  }, [otp]);

  const handleVerification = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log("=== Starting verification process ===");
    console.log("Email:", email);
    console.log("OTP:", otp);

    try {
      // 1. Проверяем код в базе данных через RPC
      console.log("1. Checking verification code through RPC");
      const { data: hasValidCode, error: rpcError } = await supabase
        .rpc('check_verification_code', {
          p_email: email,
          p_code: otp
        });
      
      console.log("Verification code check result:", hasValidCode);
      if (rpcError) throw rpcError;
      
      if (!hasValidCode) {
        throw new Error("Неверный код или срок его действия истек");
      }

      // 2. Проверяем существование пользователя
      console.log("2. Checking if user exists");
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error checking profile:", profileError);
        throw profileError;
      }

      // 3. Создаем или получаем пользователя через Edge Function
      console.log("3. Creating or getting user through Edge Function");
      const { data: userData, error: functionError } = await supabase.functions.invoke(
        'create-auth-user',
        {
          body: JSON.stringify({ 
            email,
            code: otp,
            shouldSignIn: true // Важно! Нам нужен пароль для входа
          })
        }
      );

      if (functionError) {
        console.error("Error creating/getting user:", functionError);
        throw functionError;
      }

      if (!userData.password) {
        throw new Error("Не получен пароль для входа");
      }

      // 4. Входим с учетными данными
      console.log("4. Attempting to sign in");
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: userData.password
      });

      if (signInError) {
        console.error("5. Sign in error:", signInError);
        throw signInError;
      }

      // 5. Обновляем статус кода верификации
      const { error: updateError } = await supabase
        .from('verification_codes')
        .update({ status: 'verified' })
        .eq('email', email)
        .eq('code', otp);

      if (updateError) {
        console.error("Error updating verification code status:", updateError);
      }

      toast({
        title: "Успешно!",
        description: "Вы успешно авторизовались",
      });

      onVerificationSuccess();

    } catch (error: any) {
      console.error("=== Verification failed ===");
      console.error("Error details:", error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось проверить код",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => {
            console.log("OTP value changed:", value);
            setOtp(value);
          }}
          className="gap-2 justify-center"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  );
};

export default VerificationForm;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface VerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
}

const VerificationForm = ({ email, onVerificationSuccess }: VerificationFormProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = async () => {
    setIsLoading(true);
    console.log("=== Starting verification process ===");
    console.log("Email:", email);
    console.log("OTP:", otp);

    try {
      // 1. Проверяем код в базе данных
      console.log("1. Выполняем тестовый запрос к таблице verification_codes");
      const { data: testData, error: testError } = await supabase
        .from('verification_codes')
        .select('*')
        .limit(1);
      
      console.log("Результат тестового запроса:", { testData, testError });

      console.log("Проверяем активные коды для email:", email);
      const { data: activeCodes, error: activeCodesError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('status', 'pending');

      console.log("Результат проверки активных кодов:", { 
        data: activeCodes, 
        error: activeCodesError,
        sql: "SELECT * FROM verification_codes WHERE email = '" + email + "' AND status = 'pending'"
      });

      if (activeCodesError) {
        throw new Error("Ошибка при проверке активных кодов");
      }

      console.log("Проверяем конкретный код:", otp);
      const { data: codes, error: selectError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', otp)
        .eq('status', 'pending');

      console.log("Результат проверки кода:", { 
        codes, 
        selectError,
        sql: "SELECT * FROM verification_codes WHERE email = '" + email + "' AND code = '" + otp + "' AND status = 'pending'"
      });

      if (selectError) {
        throw new Error("Ошибка при проверке кода");
      }

      if (!codes || codes.length === 0) {
        throw new Error("Неверный код или срок его действия истек");
      }

      const now = new Date();
      const expiresAt = new Date(codes[0].expires_at);

      console.log("Проверка срока действия:", {
        now: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isExpired: now > expiresAt
      });

      if (now > expiresAt) {
        throw new Error("Срок действия кода истек");
      }

      // 2. Создаем сессию
      console.log("2. Создаем сессию с помощью signInWithPassword");
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: otp
      });

      if (signInError) {
        console.error("Ошибка при создании сессии:", signInError);
        
        // 3. Если пользователя нет, создаем его
        console.log("3. Пробуем создать пользователя");
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: otp
        });

        if (signUpError) {
          console.error("Ошибка при создании пользователя:", signUpError);
          throw new Error("Не удалось создать пользователя");
        }
      }

      // 4. Обновляем статус кода
      const { error: updateError } = await supabase
        .from('verification_codes')
        .update({ status: 'verified' })
        .eq('email', email)
        .eq('code', otp);

      if (updateError) {
        console.error("Ошибка при обновлении статуса кода:", updateError);
        throw new Error("Ошибка при обновлении статуса кода");
      }

      console.log("=== Verification completed successfully ===");
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
      <Button
        onClick={handleVerification}
        className="w-full"
        disabled={isLoading || otp.length !== 6}
      >
        {isLoading ? "Проверка..." : "Подтвердить"}
      </Button>
    </div>
  );
};

export default VerificationForm;
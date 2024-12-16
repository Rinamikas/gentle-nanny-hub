import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { testAuthFlow } from "@/tests/auth-flow.test";

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
      // Запускаем тест процесса аутентификации
      console.log("Running auth flow test");
      const { hasValidCode, initialSession } = await testAuthFlow(email, otp);
      console.log("Auth flow test results:", { hasValidCode, initialSession });

      if (!hasValidCode) {
        throw new Error("Неверный код или срок его действия истек");
      }

      // Верифицируем OTP
      console.log("Verifying OTP with type 'email'");
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      
      console.log("Verify OTP response:", { data: verifyData, error: verifyError });

      if (verifyError) {
        console.error("Verification error details:", {
          error: verifyError,
          message: verifyError.message,
          status: verifyError.status
        });
        throw verifyError;
      }

      // Проверяем создание сессии
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Session after verification:", session);
      
      if (sessionError || !session) {
        console.error("Session error:", sessionError);
        throw new Error("Ошибка при создании сессии");
      }

      // Обновляем статус кода в БД
      console.log("Updating verification code status");
      const { error: updateError } = await supabase
        .from("verification_codes")
        .update({ status: 'verified' })
        .eq("email", email)
        .eq("code", otp);

      if (updateError) {
        console.error("Status update error:", updateError);
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
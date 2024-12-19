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
      // 1. Проверяем код в базе данных через RPC
      console.log("1. Checking verification code through RPC");
      const { data: hasValidCode, error: rpcError } = await supabase
        .rpc('check_verification_code', {
          p_email: email,
          p_code: otp
        });

      if (rpcError) {
        console.error("RPC error:", rpcError);
        throw new Error("Ошибка при проверке кода");
      }

      console.log("Verification code check result:", hasValidCode);
      if (!hasValidCode) {
        throw new Error("Неверный код или срок его действия истек");
      }

      // 2. Создаем/обновляем пользователя через Edge Function
      console.log("2. Creating/updating user through Edge Function");
      const { data: createUserData, error: createUserError } = await supabase.functions.invoke(
        'create-auth-user',
        {
          body: { email }
        }
      );

      if (createUserError) {
        console.error("Error creating/updating user:", createUserError);
        throw createUserError;
      }

      console.log("User created/updated successfully:", createUserData);

      // 3. Обновляем статус кода в БД
      console.log("3. Updating verification code status");
      const { error: codeUpdateError } = await supabase
        .from("verification_codes")
        .update({ status: 'verified' })
        .eq("email", email)
        .eq("code", otp);

      if (codeUpdateError) {
        console.error("Status update error:", codeUpdateError);
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
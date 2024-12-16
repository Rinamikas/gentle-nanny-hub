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
      // 1. Проверяем код в базе данных
      console.log("1. Checking verification code");
      const { hasValidCode } = await testAuthFlow(email, otp);
      console.log("Verification code check result:", { hasValidCode });

      if (!hasValidCode) {
        throw new Error("Неверный код или срок его действия истек");
      }

      // 2. Пробуем войти с текущими данными
      console.log("2. Attempting to sign in");
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: otp,
      });

      console.log("3. SignIn response:", { data: signInData, error: signInError });

      // 3. Если пользователь не существует, создаем его через API
      if (signInError && signInError.message.includes("Invalid login credentials")) {
        console.log("4. User doesn't exist, creating via API");
        
        const { data: createData, error: createError } = await supabase.functions.invoke(
          'create-user',
          {
            body: JSON.stringify({
              email,
              password: otp
            })
          }
        );

        if (createError) {
          console.error("5. User creation error:", createError);
          throw createError;
        }

        console.log("6. User created successfully:", createData);

        // 4. Пробуем войти снова после создания пользователя
        console.log("7. Attempting to sign in after user creation");
        const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
          email,
          password: otp,
        });

        if (newSignInError) {
          console.error("8. Sign in error after creation:", newSignInError);
          throw newSignInError;
        }

        console.log("9. Sign in successful after creation");
      } else if (signInError) {
        console.error("10. Unexpected sign in error:", signInError);
        throw signInError;
      }

      // 5. Обновляем пароль на новый код
      console.log("11. Updating password");
      const { error: updateError } = await supabase.auth.updateUser({
        password: otp
      });

      if (updateError) {
        console.error("12. Password update error:", updateError);
        throw updateError;
      }

      console.log("13. Password successfully updated");

      // 6. Проверяем создание сессии
      console.log("14. Checking session");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("15. Current session:", session);
      
      if (sessionError) {
        console.error("16. Session error:", sessionError);
        throw new Error("Ошибка при создании сессии");
      }

      if (!session) {
        console.error("17. No session created");
        throw new Error("Сессия не была создана");
      }

      // 7. Обновляем статус кода в БД
      console.log("18. Updating verification code status");
      const { error: codeUpdateError } = await supabase
        .from("verification_codes")
        .update({ status: 'verified' })
        .eq("email", email)
        .eq("code", otp);

      if (codeUpdateError) {
        console.error("19. Status update error:", codeUpdateError);
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
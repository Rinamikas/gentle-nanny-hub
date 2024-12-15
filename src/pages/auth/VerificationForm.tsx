import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { testVerificationFlow } from "@/tests/verification.test";

interface VerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
}

const VerificationForm = ({ email, onVerificationSuccess }: VerificationFormProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = async () => {
    setIsLoading(true);
    console.log("Начинаем проверку кода:", otp, "для email:", email);

    try {
      // Сначала запускаем тест для проверки работы с БД
      await testVerificationFlow();
      
      // Делаем простой запрос без сравнения даты
      const { data: codes, error: selectError } = await supabase
        .from("verification_codes")
        .select("*")
        .eq("email", email)
        .eq("code", otp)
        .eq("status", "pending");

      console.log("Результат проверки кода:", { codes, selectError });

      if (selectError) {
        console.error("Ошибка при проверке кода:", selectError);
        throw new Error("Ошибка при проверке кода верификации");
      }

      if (!codes || codes.length === 0) {
        console.error("Код не найден");
        throw new Error("Неверный код");
      }

      // Теперь проверяем срок действия отдельно
      const code = codes[0];
      const now = new Date();
      const expiresAt = new Date(code.expires_at);

      console.log("Проверка срока действия:", { now, expiresAt });

      if (now > expiresAt) {
        console.error("Код просрочен");
        throw new Error("Код просрочен");
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true
        }
      });

      console.log("Результат создания сессии через OTP:", { signInData, signInError });
      
      if (signInError) {
        console.error("Ошибка при создании сессии:", signInError);
        throw signInError;
      }

      // После создания сессии верифицируем OTP
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      console.log("Результат верификации OTP:", { verifyData, verifyError });
      
      if (verifyError) {
        console.error("Ошибка при верификации OTP:", verifyError);
        throw verifyError;
      }

      // Проверяем сессию
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Финальная проверка сессии:", { session, sessionError });
      
      if (sessionError) {
        console.error("Ошибка при проверке сессии:", sessionError);
        throw sessionError;
      }
      
      if (!session) {
        throw new Error("Не удалось создать сессию");
      }

      // Удаляем использованный код верификации
      const { error: deleteError } = await supabase
        .from("verification_codes")
        .delete()
        .eq("id", code.id);

      console.log("Результат удаления кода:", { deleteError });
      
      if (deleteError) {
        console.error("Ошибка при удалении кода:", deleteError);
        // Не выбрасываем ошибку, так как верификация уже прошла успешно
      }

      toast({
        title: "Успешно!",
        description: "Вы успешно авторизовались",
      });

      onVerificationSuccess();

    } catch (error: any) {
      console.error("Ошибка при проверке кода:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось проверить код",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => {
            console.log("OTP value changed:", value);
            setOtp(value);
          }}
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

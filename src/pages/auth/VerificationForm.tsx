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
    console.log("Начинаем проверку кода:", otp, "для email:", email);

    try {
      // Форматируем текущую дату в ISO формат
      const now = new Date().toISOString();
      
      // Проверяем код верификации
      const { data: codes, error: selectError } = await supabase
        .from("verification_codes")
        .select()
        .eq("email", email)
        .eq("code", otp)
        .eq("status", "pending")
        .gt("expires_at", now)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      console.log("Результат проверки кода:", { codes, selectError });

      if (selectError) {
        if (selectError.code === 'PGRST116') {
          throw new Error("Неверный или просроченный код");
        }
        throw selectError;
      }

      // Обновляем статус кода на verified
      const { error: updateError } = await supabase
        .from("verification_codes")
        .update({ status: "verified" })
        .eq("id", codes.id);

      console.log("Результат обновления статуса:", { updateError });
      if (updateError) throw updateError;

      // Создаем сессию через OTP
      const { data: signInData, error: signInError } = await supabase.auth.signInWithOtp({
        email,
        token: otp,
        options: {
          shouldCreateUser: true
        }
      });

      console.log("Результат создания сессии через OTP:", { signInData, signInError });
      
      if (signInError) throw signInError;

      // Ждем немного, чтобы сессия успела установиться
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Проверяем сессию
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Финальная проверка сессии:", { session, sessionError });
      
      if (sessionError) throw sessionError;
      if (!session) {
        throw new Error("Не удалось создать сессию");
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
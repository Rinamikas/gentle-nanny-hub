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
      // Проверяем код в базе данных
      const { data: codes, error: fetchError } = await supabase
        .from("verification_codes")
        .select("*")
        .eq("email", email)
        .eq("code", otp)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error("Ошибка при проверке кода в БД:", fetchError);
        throw new Error("Ошибка при проверке кода");
      }

      if (!codes || codes.length === 0) {
        console.error("Код не найден или истек срок его действия");
        throw new Error("Неверный код или истек срок его действия");
      }

      console.log("Код найден в БД, пытаемся верифицировать через auth API");

      // Создаем сессию через signInWithOtp
      const { data: signInData, error: signInError } = await supabase.auth.signInWithOtp({
        email,
        token: otp,
        options: {
          shouldCreateUser: true,
          data: {
            email_verified: true
          }
        }
      });

      if (signInError) {
        console.error("Ошибка при создании сессии:", signInError);
        throw new Error("Ошибка при создании сессии");
      }

      if (!signInData.session) {
        console.error("Сессия не была создана");
        throw new Error("Не удалось создать сессию");
      }

      // После успешного создания сессии обновляем статус кода
      const { error: updateError } = await supabase
        .from("verification_codes")
        .update({ status: 'verified' })
        .eq("id", codes[0].id);

      if (updateError) {
        console.error("Ошибка при обновлении статуса кода:", updateError);
        // Не выбрасываем ошибку, так как сессия уже создана
      }

      console.log("Верификация успешна, обновляем UI");
      
      toast({
        title: "Успешно!",
        description: "Вы успешно авторизовались",
      });

      // Проверяем наличие сессии перед редиректом
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Сессия успешно создана:", session);
        onVerificationSuccess();
      } else {
        console.error("Сессия не найдена после создания");
        throw new Error("Ошибка при создании сессии");
      }

    } catch (error: any) {
      console.error("Ошибка при проверке кода:", error);
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
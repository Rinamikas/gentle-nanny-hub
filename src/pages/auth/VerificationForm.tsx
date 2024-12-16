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
      // Верифицируем OTP через Supabase Auth
      console.log("Верифицируем код через Supabase Auth");
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (verifyError) {
        console.error("Ошибка при верификации кода:", verifyError);
        throw new Error("Ошибка при верификации кода");
      }

      console.log("Код успешно верифицирован, обновляем статус в БД");

      // После успешной верификации обновляем статус кода в БД
      const { data: codes, error: fetchError } = await supabase
        .from("verification_codes")
        .select("*")
        .eq("email", email)
        .eq("code", otp)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error("Ошибка при поиске кода в БД:", fetchError);
        throw new Error("Ошибка при проверке кода");
      }

      if (codes && codes.length > 0) {
        const { error: updateError } = await supabase
          .from("verification_codes")
          .update({ status: 'verified' })
          .eq("id", codes[0].id);

        if (updateError) {
          console.error("Ошибка при обновлении статуса кода:", updateError);
          throw new Error("Ошибка при обновлении статуса кода");
        }
      }

      console.log("Верификация успешно завершена");
      toast({
        title: "Успешно!",
        description: "Вы успешно авторизовались",
      });

      onVerificationSuccess();

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
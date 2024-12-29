import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { OTPInput } from "@/components/ui/input-otp";

interface VerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const VerificationForm = ({ email, onVerificationSuccess, onBack }: VerificationFormProps) => {
  const [otp, setOtp] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("OTP value changed:", otp);
  }, [otp]);

  const handleVerification = async () => {
    try {
      console.log("=== Starting verification process ===");
      console.log("Email:", email);
      console.log("OTP:", otp);

      // 1. Проверяем код через RPC
      console.log("1. Checking verification code through RPC");
      const { data: isValid, error: verificationError } = await supabase
        .rpc('check_verification_code', {
          p_email: email,
          p_code: otp
        });

      if (verificationError) {
        throw verificationError;
      }

      console.log("Verification code check result:", isValid);

      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Неверный код подтверждения",
        });
        return;
      }

      // 2. Проверяем существование пользователя через Edge Function
      console.log("2. Checking if user exists");
      const { data: userExists, error: userCheckError } = await supabase.functions.invoke(
        'check-user-exists',
        {
          body: { email }
        }
      );

      if (userCheckError) {
        console.error("Error checking user:", userCheckError);
        throw userCheckError;
      }

      // 3. Создаем или получаем сессию
      const { data: authData, error: signInError } = await supabase.auth.signInWithOtp({
        email,
        token: otp,
        options: {
          shouldCreateUser: !userExists
        }
      });

      if (signInError) {
        console.error("Error signing in:", signInError);
        throw signInError;
      }

      // 4. Обновляем статус кода верификации
      const { error: updateError } = await supabase
        .from('verification_codes')
        .update({ status: 'verified' })
        .eq('email', email)
        .eq('code', otp);

      if (updateError) {
        console.error("Error updating verification status:", updateError);
        // Не выбрасываем ошибку, так как авторизация уже прошла успешно
      }

      toast({
        title: "Успешно",
        description: "Вы успешно авторизовались",
      });

      onVerificationSuccess();

    } catch (error: any) {
      console.error("=== Verification failed ===");
      console.error("Error details:", error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось выполнить проверку",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Подтверждение</h2>
        <p className="text-gray-500">
          Введите код, отправленный на {email}
        </p>
      </div>

      <div className="flex justify-center">
        <OTPInput
          value={otp}
          onChange={setOtp}
          maxLength={6}
          containerClassName="group flex items-center has-[:disabled]:opacity-50"
          className="[&_input]:mx-1 [&_input]:h-10 [&_input]:w-10 [&_input]:rounded-md [&_input]:border [&_input]:bg-transparent [&_input]:text-center [&_input]:text-lg [&_input]:font-semibold [&_input]:transition-all [&_input]:focus:border-primary [&_input]:focus:outline-none"
        />
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Назад
        </Button>
        <Button 
          onClick={handleVerification}
          disabled={otp.length !== 6}
        >
          Подтвердить
        </Button>
      </div>
    </div>
  );
};

export default VerificationForm;
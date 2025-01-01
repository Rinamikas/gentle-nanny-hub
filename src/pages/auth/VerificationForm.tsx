import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface VerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const VerificationForm = ({ email, onVerificationSuccess, onBack }: VerificationFormProps) => {
  const [otp, setOtp] = useState("");
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

      // 2. Создаем сессию через OTP
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true
        }
      });

      if (signInError) {
        console.error("Error signing in:", signInError);
        throw signInError;
      }

      // 3. Обновляем статус кода верификации
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
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="w-10 h-10 text-center border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              value={otp[index] || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value.match(/^[0-9]$/)) {
                  const newOtp = otp.split('');
                  newOtp[index] = value;
                  setOtp(newOtp.join(''));
                  
                  // Автоматически переходим к следующему полю
                  if (index < 5 && value) {
                    const nextInput = e.target.parentElement?.querySelector(
                      `input[type="text"]:nth-child(${index + 2})`
                    ) as HTMLInputElement;
                    if (nextInput) {
                      nextInput.focus();
                    }
                  }
                }
              }}
              onKeyDown={(e) => {
                // При нажатии Backspace переходим к предыдущему полю
                if (e.key === 'Backspace' && !otp[index] && index > 0) {
                  const newOtp = otp.split('');
                  newOtp[index - 1] = '';
                  setOtp(newOtp.join(''));
                  
                  const prevInput = e.currentTarget.parentElement?.querySelector(
                    `input[type="text"]:nth-child(${index})`
                  ) as HTMLInputElement;
                  if (prevInput) {
                    prevInput.focus();
                  }
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text');
                const numbers = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
                setOtp(numbers);
              }}
            />
          ))}
        </div>
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
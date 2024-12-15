import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { testVerificationFlow } from "@/tests/verification.test";

interface VerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
}

const VerificationForm = ({ email, onVerificationSuccess }: VerificationFormProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const runTest = async () => {
    setIsTesting(true);
    try {
      await testVerificationFlow();
      toast({
        title: "Тест завершен",
        description: "Проверьте консоль для деталей",
      });
    } catch (error) {
      console.error("Ошибка при запуске теста:", error);
      toast({
        title: "Ошибка теста",
        description: "Проверьте консоль для деталей",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleVerification = async (value: string) => {
    if (value.length !== 6) return;
    
    setIsLoading(true);
    console.log("Начинаем проверку кода:", value, "для email:", email);
    
    try {
      // Проверяем код
      const { data: codes, error: selectError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', value)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      console.log("Результат проверки кода:", { codes, selectError });

      if (selectError) {
        console.error("Ошибка при проверке кода:", selectError);
        throw selectError;
      }

      if (!codes || codes.length === 0) {
        // Для отладки получаем все коды
        const { data: allCodes } = await supabase
          .from('verification_codes')
          .select('*')
          .eq('email', email);
        
        console.log("Все коды для отладки:", allCodes);
        throw new Error('Неверный или просроченный код подтверждения');
      }

      // Обновляем статус кода
      const { error: updateError } = await supabase
        .from('verification_codes')
        .update({ status: 'verified' })
        .eq('id', codes[0].id);

      if (updateError) {
        console.error("Ошибка при обновлении статуса:", updateError);
        throw updateError;
      }

      // Создаем сессию
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: value,
      });

      if (signInError) {
        console.log("Ошибка входа, пробуем создать пользователя:", signInError);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: value,
        });

        if (signUpError) {
          console.error("Ошибка регистрации:", signUpError);
          throw signUpError;
        }
      }

      toast({
        title: "Успешная авторизация",
        description: "Добро пожаловать в систему",
      });
      
      onVerificationSuccess();
    } catch (error: any) {
      console.error('Ошибка при проверке кода:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Неверный код подтверждения",
        variant: "destructive",
      });
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Код подтверждения отправлен на {email}
        </p>
        <div className="flex flex-col items-center space-y-4">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => {
              console.log("OTP value changed:", value);
              setCode(value);
            }}
            onComplete={handleVerification}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot key={index} index={index} className="w-10 h-12 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
      <Button
        onClick={() => handleVerification(code)}
        className="w-full"
        disabled={code.length !== 6 || isLoading}
      >
        {isLoading ? "Проверка..." : "Подтвердить"}
      </Button>
      
      <Button
        onClick={runTest}
        variant="outline"
        className="w-full mt-4"
        disabled={isTesting}
      >
        {isTesting ? "Тестирование..." : "Запустить тест верификации"}
      </Button>
    </div>
  );
};

export default VerificationForm;

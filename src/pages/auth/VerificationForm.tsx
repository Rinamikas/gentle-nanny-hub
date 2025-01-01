import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface VerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const VerificationForm = ({ email, onVerificationSuccess, onBack }: VerificationFormProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const firstInput = document.querySelector('input[id^="otp-"]') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  useEffect(() => {
    if (otp.length === 6) {
      handleVerification();
    }
  }, [otp]);

  const ensureProfileExists = async (userId: string) => {
    console.log("Проверяем существование профиля для пользователя:", userId);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Ошибка при проверке профиля:", profileError);
      return;
    }

    if (!profile) {
      console.log("Профиль не найден, создаем новый");
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ 
          id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error("Ошибка при создании профиля:", insertError);
        return;
      }
      console.log("Профиль успешно создан");
    } else {
      console.log("Профиль уже существует");
    }
  };

  const handleVerification = async () => {
    if (isLoading) return;
    
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
      
      console.log("Verification code check result:", hasValidCode);
      if (rpcError) throw rpcError;
      
      if (!hasValidCode) {
        throw new Error("Неверный код или срок его действия истек");
      }

      // 2. Создаем/обновляем пользователя через Edge Function
      console.log("2. Creating/updating user through Edge Function");
      const { data: userData, error: functionError } = await supabase.functions.invoke(
        'create-auth-user',
        {
          body: JSON.stringify({ 
            email,
            code: otp
          })
        }
      );

      console.log("Edge function response:", userData);
      
      if (functionError) {
        console.error("Error from edge function:", functionError);
        throw functionError;
      }

      if (!userData?.password) {
        console.error("Invalid response from edge function:", userData);
        throw new Error("Не получен пароль от сервера");
      }

      console.log("3. User created/updated successfully");
      
      // 4. Входим с созданными учетными данными
      console.log("4. Attempting sign in with verification code as password");

      // Увеличиваем задержку перед входом до 5 секунд
      await new Promise(resolve => setTimeout(resolve, 5000));

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: userData.password
      });

      console.log("Sign in response:", signInData);

      if (signInError) {
        console.error("5. Sign in error:", signInError);
        throw signInError;
      }

      // Проверяем и создаем профиль если нужно
      if (signInData.user) {
        await ensureProfileExists(signInData.user.id);
      }

      // 5. Обновляем статус кода верификации
      const { error: updateError } = await supabase
        .from('verification_codes')
        .update({ status: 'verified' })
        .eq('email', email)
        .eq('code', otp);

      if (updateError) {
        console.error("Error updating verification code status:", updateError);
      }

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
    </div>
  );
};

export default VerificationForm;
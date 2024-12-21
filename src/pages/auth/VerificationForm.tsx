import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VerificationFormProps {
  email: string;
  onBack: () => void;
  onVerificationSuccess?: () => void;
}

export default function VerificationForm({ email, onBack, onVerificationSuccess }: VerificationFormProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (code.length === 6) {
      formRef.current?.requestSubmit();
    }
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc("check_verification_code", {
        p_email: email,
        p_code: code,
      });

      if (error) throw error;

      if (data) {
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: {
              verification_code: code
            }
          }
        });

        if (signInError) throw signInError;

        if (onVerificationSuccess) {
          onVerificationSuccess();
        } else {
          navigate("/");
        }
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Неверный код подтверждения",
        });
      }
    } catch (error: any) {
      console.error("Ошибка верификации:", error);
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
    <form onSubmit={handleSubmit} className="space-y-4" ref={formRef}>
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Введите код подтверждения</h2>
        <p className="text-sm text-gray-500">
          Мы отправили код на {email}
        </p>
      </div>

      <div className="flex justify-center my-4">
        <InputOTP
          value={code}
          onChange={setCode}
          maxLength={6}
          disabled={isLoading}
          render={({ slots }) => (
            <InputOTPGroup>
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} {...slot} />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack} disabled={isLoading}>
          Назад
        </Button>
        <Button type="submit" disabled={code.length !== 6 || isLoading}>
          {isLoading ? "Проверка..." : "Подтвердить"}
        </Button>
      </div>
    </form>
  );
}
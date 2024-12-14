import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";

interface VerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
}

const VerificationForm = ({ email, onVerificationSuccess }: VerificationFormProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async (value: string) => {
    setIsLoading(true);
    
    // Simulate verification
    // This should be replaced with actual API call
    setTimeout(() => {
      console.log("Verifying code:", value, "for email:", email);
      if (value === "123456") {
        toast({
          title: "Успешная авторизация",
          description: "Добро пожаловать в систему",
        });
        onVerificationSuccess();
      } else {
        toast({
          title: "Ошибка",
          description: "Неверный код подтверждения",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Код подтверждения отправлен на {email}
        </p>
        <InputOTP
          value={code}
          onChange={setCode}
          maxLength={6}
          onComplete={handleComplete}
          render={({ slots }) => (
            <InputOTPGroup>
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} {...slot} index={index} />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>
      <Button
        onClick={() => handleComplete(code)}
        className="w-full"
        disabled={code.length !== 6 || isLoading}
      >
        {isLoading ? "Проверка..." : "Подтвердить"}
      </Button>
    </div>
  );
};

export default VerificationForm;
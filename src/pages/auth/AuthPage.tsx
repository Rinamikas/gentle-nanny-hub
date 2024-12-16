import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmailForm } from "./EmailForm";
import VerificationForm from "./VerificationForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailSubmit = async (submittedEmail: string) => {
    try {
      console.log("Sending verification code to:", submittedEmail);
      
      const { error } = await supabase.functions.invoke('verify-email', {
        body: { email: submittedEmail }
      });

      if (error) throw error;

      setEmail(submittedEmail);
      setShowVerification(true);
      
      toast({
        title: "Код отправлен",
        description: "Проверьте вашу почту",
      });
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отправить код верификации",
      });
    }
  };

  const handleVerificationSuccess = () => {
    console.log("Verification successful, navigating to home");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-primary mb-2">
            Nanny Management System
          </h1>
          <p className="text-muted-foreground">
            Вход в панель администратора
          </p>
        </div>
        
        {!showVerification ? (
          <EmailForm onEmailSubmit={handleEmailSubmit} />
        ) : (
          <VerificationForm
            email={email}
            onVerificationSuccess={handleVerificationSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
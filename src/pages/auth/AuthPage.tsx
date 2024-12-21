import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import EmailForm from "./EmailForm";
import VerificationForm from "./VerificationForm";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const { session } = useSessionContext();
  const navigate = useNavigate();

  // Если пользователь уже авторизован, перенаправляем на главную
  if (session) {
    console.log("Пользователь уже авторизован, перенаправление...");
    navigate("/");
    return null;
  }

  const handleEmailSubmit = (submittedEmail: string) => {
    console.log("Email отправлен:", submittedEmail);
    setEmail(submittedEmail);
    setShowVerification(true);
  };

  const handleVerificationSuccess = () => {
    console.log("Верификация успешна, перенаправление...");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          {!showVerification ? (
            <EmailForm onSubmit={handleEmailSubmit} />
          ) : (
            <VerificationForm 
              email={email} 
              onSuccess={handleVerificationSuccess}
              onBack={() => setShowVerification(false)} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
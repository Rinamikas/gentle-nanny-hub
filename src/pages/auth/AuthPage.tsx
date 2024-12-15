import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailForm from "./EmailForm";
import VerificationForm from "./VerificationForm";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (submittedEmail: string) => {
    console.log("Email submitted, showing verification form for:", submittedEmail);
    setEmail(submittedEmail);
    setShowVerification(true);
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
import { createContext, useContext, useState, useEffect } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";

interface AuthContextType {
  isInitialAuthCheckComplete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialAuthCheckComplete, setIsInitialAuthCheckComplete] = useState(false);
  const { session } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!session) {
        console.log("Нет активной сессии, перенаправление на /auth");
        navigate("/auth");
      }
      setIsInitialAuthCheckComplete(true);
    };

    checkAuth();
  }, [session, navigate]);

  if (!isInitialAuthCheckComplete) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ isInitialAuthCheckComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
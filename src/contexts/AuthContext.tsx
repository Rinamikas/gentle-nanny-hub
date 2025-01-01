import { createContext, useContext, useState, useEffect } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isInitialAuthCheckComplete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialAuthCheckComplete, setIsInitialAuthCheckComplete] = useState(true);
  const { session } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthProvider: Начало проверки сессии");
    
    if (!session) {
      console.log("AuthProvider: Сессия отсутствует, перенаправление на /auth");
      navigate("/auth", { replace: true });
    } else {
      console.log("AuthProvider: Сессия активна", session.user.id);
    }
  }, [session, navigate]);

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
import { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-semibold text-[#8B5CF6] mb-6">
        Панель управления
      </h1>
      <p className="text-gray-600">
        Добро пожаловать в систему управления нянями
      </p>
    </div>
  );
};

export default Index;
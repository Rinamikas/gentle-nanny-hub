import { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import AdminLayout from "@/components/AdminLayout";

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
    <AdminLayout>
      <div className="animate-fade-in">
        <h1 className="text-3xl font-semibold text-[#FEC6A1] mb-6">
          Панель управления
        </h1>
        <p className="text-[#E5DEFF]">
          Добро пожаловать в систему управления нянями
        </p>
      </div>
    </AdminLayout>
  );
};

export default Index;
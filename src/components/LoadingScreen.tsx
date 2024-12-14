import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white animate-fade-in">
      <Loader2 className="w-12 h-12 text-[#8B5CF6] animate-spin mb-4" />
      <h1 className="text-2xl font-semibold text-[#8B5CF6]">
        Nanny Management System
      </h1>
    </div>
  );
};

export default LoadingScreen;
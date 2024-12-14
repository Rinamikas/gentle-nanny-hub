import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F2FCE2] animate-fade-in">
      <Loader2 className="w-12 h-12 text-[#E5DEFF] animate-spin mb-4" />
      <h1 className="text-2xl font-semibold text-[#FEC6A1]">
        Nanny Management System
      </h1>
    </div>
  );
};

export default LoadingScreen;
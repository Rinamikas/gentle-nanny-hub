import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingScreen;
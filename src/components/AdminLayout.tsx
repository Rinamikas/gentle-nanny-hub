import { Outlet, useLocation } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Button } from "./ui/button";
import { fillFormWithTestData } from "@/utils/formTestUtils";
import { Toaster } from "./ui/toaster";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const AdminLayout = () => {
  const { session } = useSessionContext();
  const location = useLocation();

  useEffect(() => {
    console.log("Current user:", session?.user);
  }, [session]);

  const showTestButtons = location.pathname.includes("/create") || location.pathname.includes("/edit");

  const handleTestDataClick = () => {
    fillFormWithTestData("valid");
  };

  const handleInvalidDataClick = () => {
    fillFormWithTestData("invalid");
  };

  return (
    <div className="min-h-screen bg-background">
      {showTestButtons && (
        <div
          className={cn(
            "fixed bottom-4 right-4 z-50 flex gap-2 rounded-lg bg-background p-2 shadow-lg"
          )}
        >
          <Button size="sm" onClick={handleTestDataClick}>
            Valid Data
          </Button>
          <Button size="sm" variant="destructive" onClick={handleInvalidDataClick}>
            Invalid Data
          </Button>
        </div>
      )}
      <Outlet />
      <Toaster />
    </div>
  );
};

export default AdminLayout;
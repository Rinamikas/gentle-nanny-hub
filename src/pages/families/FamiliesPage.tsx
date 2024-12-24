import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingScreen from "@/components/LoadingScreen";
import FamiliesTable from "./components/FamiliesTable";
import type { ParentProfile } from "./types/parent-types";

const FamiliesPage = () => {
  const navigate = useNavigate();

  const { data: families, isLoading } = useQuery({
    queryKey: ["families"],
    queryFn: async () => {
      console.log("Loading families list...");
      const { data: familiesData, error } = await supabase
        .from("parent_profiles")
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            main_phone,
            photo_url,
            created_at,
            updated_at,
            email
          ),
          children (*)
        `);

      if (error) {
        console.error("Error loading families:", error);
        throw error;
      }

      console.log("Loaded families data:", familiesData);
      return familiesData as ParentProfile[];
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Семьи и дети</h1>
        <Button onClick={() => navigate("/families/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить семью
        </Button>
      </div>

      <FamiliesTable families={families || []} />
    </div>
  );
};

export default FamiliesPage;
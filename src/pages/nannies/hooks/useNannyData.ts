import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type NannyWithDetails = Database['public']['Tables']['nanny_profiles']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'] & {
    email?: string;
    phone?: string;
  };
  nanny_documents?: {
    type: string;
    file_url: string;
  }[];
  nanny_training?: {
    stage: Database['public']['Enums']['training_stage'];
  };
};

export const useNannyData = (id?: string) => {
  return useQuery({
    queryKey: ["nanny", id],
    queryFn: async () => {
      if (!id || id === ":id") {
        console.log("Invalid nanny ID:", id);
        return null;
      }
      
      console.log("Fetching nanny data for ID:", id);
      const { data, error } = await supabase
        .from("nanny_profiles")
        .select(`
          *,
          profiles!inner (
            id,
            first_name,
            last_name,
            main_phone,
            photo_url,
            created_at,
            updated_at,
            email
          ),
          nanny_documents (
            type,
            file_url
          ),
          nanny_training (
            stage
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching nanny data:", error);
        throw error;
      }
      
      console.log("Received nanny data:", data);
      return data as NannyWithDetails;
    },
    enabled: !!id && id !== ":id",
  });
};
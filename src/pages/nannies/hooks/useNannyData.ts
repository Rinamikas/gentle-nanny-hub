import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNannyData = (id?: string) => {
  return useQuery({
    queryKey: ["nanny", id],
    queryFn: async () => {
      if (!id) return null;
      
      console.log("Making Supabase query for nanny ID:", id);
      const { data, error } = await supabase
        .from("nanny_profiles")
        .select(`
          *,
          profiles(
            first_name,
            last_name,
            email,
            phone
          ),
          nanny_documents(
            type,
            file_url
          ),
          nanny_training(
            stage
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching nanny data:", error);
        throw error;
      }
      
      console.log("Received nanny data:", data);
      return data;
    },
    enabled: !!id,
  });
};
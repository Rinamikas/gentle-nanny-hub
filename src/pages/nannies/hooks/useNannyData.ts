import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type NannyWithDetails = Database['public']['Tables']['nanny_profiles']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  nanny_documents?: {
    type: string;
    file_url: string;
  }[];
  nanny_training?: {
    stage: Database['public']['Enums']['training_stage'];
  };
  relative_phone?: string;
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
      
      // Получаем основные данные няни
      const { data: nannyData, error: nannyError } = await supabase
        .from("nanny_profiles")
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            main_phone,
            photo_url,
            created_at,
            updated_at
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

      if (nannyError) {
        console.error("Error fetching nanny data:", nannyError);
        throw nannyError;
      }

      if (!nannyData) {
        return null;
      }

      // Получаем email пользователя
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user data:", userError);
        throw userError;
      }

      // Объединяем данные
      const enrichedData = {
        ...nannyData,
        profiles: {
          ...nannyData.profiles,
          email: userData.user?.email
        }
      };
      
      console.log("Received nanny data:", enrichedData);
      return enrichedData as NannyWithDetails;
    },
    enabled: !!id && id !== ":id",
  });
};
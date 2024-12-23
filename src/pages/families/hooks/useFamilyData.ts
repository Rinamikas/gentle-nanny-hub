import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ParentProfile } from "../types/parent-types";

export const useFamilyData = (familyId?: string) => {
  console.log("useFamilyData: запрос данных для familyId =", familyId);
  
  return useQuery({
    queryKey: ['family', familyId],
    queryFn: async () => {
      console.log("useFamilyData: загрузка данных семьи для id =", familyId);
      if (!familyId) return null;

      const { data: parentProfile, error: parentError } = await supabase
        .from('parent_profiles')
        .select(`
          *,
          profiles (
            id,
            email,
            first_name,
            last_name,
            phone,
            photo_url,
            created_at,
            updated_at
          )
        `)
        .eq('id', familyId)
        .single();

      if (parentError) {
        console.error("useFamilyData: ошибка загрузки parent_profile:", parentError);
        throw parentError;
      }

      console.log("useFamilyData: получены данные семьи:", parentProfile);
      return parentProfile as unknown as ParentProfile;
    },
    enabled: !!familyId
  });
};
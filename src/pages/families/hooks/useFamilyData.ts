import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ParentProfile } from "@/integrations/supabase/types";

export const useFamilyData = (familyId?: string) => {
  return useQuery({
    queryKey: ['family', familyId],
    queryFn: async () => {
      console.log("FamilyForm: загрузка данных семьи для id =", familyId);
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
        console.error("FamilyForm: ошибка загрузки parent_profile:", parentError);
        throw parentError;
      }

      console.log("FamilyForm: получены данные семьи:", parentProfile);
      return parentProfile as ParentProfile;
    },
    enabled: !!familyId
  });
};
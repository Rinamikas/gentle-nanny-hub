import { useSessionContext } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProfileForm from "./components/ProfileForm";
import ProfileHeader from "./components/ProfileHeader";
import ParentForm from "./components/ParentForm";
import { toast } from "@/hooks/use-toast";
import type { Profile } from "./types";

const ProfilePage = () => {
  const { session } = useSessionContext();

  const { data: profile, isLoading, refetch } = useQuery<Profile>({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('No user ID found');
      }

      console.log('Fetching profile data for user:', session.user.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            role,
            created_at,
            user_id
          )
        `)
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить профиль",
          variant: "destructive",
        });
        throw profileError;
      }

      console.log('Profile data received:', profileData);

      const profile: Profile = {
        ...profileData,
        user_roles: Array.isArray(profileData.user_roles) 
          ? profileData.user_roles 
          : profileData.user_roles ? [profileData.user_roles] : []
      };

      return profile;
    },
    enabled: !!session?.user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isParent = profile?.user_roles?.some(role => role.role === 'parent');

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <ProfileHeader profile={profile} />
      <div className="mt-8">
        <ProfileForm profile={profile} onUpdate={refetch} />
      </div>
      {isParent && profile && (
        <div className="mt-8">
          <ParentForm profile={profile} onUpdate={refetch} />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
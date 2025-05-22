
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuthUser() {
  const [user, setUser] = useState<null | { id: string, email: string }> (null);
  const [profile, setProfile] = useState<null | { id: string, username: string | null, avatar_url: string | null}>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setProfile(null);
      } else {
        setUser({ id: session.user.id, email: session.user.email || "" });
        fetchProfile(session.user.id);
      }
    });

    // 2. initial fetch
    supabase.auth.getSession().then(({ data: { session }}) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || "" });
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    function fetchProfile(id: string) {
      supabase.from("profiles").select("id, username, avatar_url").eq("id", id).maybeSingle().then(({ data }) => {
        setProfile(data || null);
      });
    }

    return () => { subscription.unsubscribe(); };
  }, []);

  return { user, profile, loading };
}

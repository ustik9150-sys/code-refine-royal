import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async (uid: string | null) => {
      if (!uid) {
        if (mounted) {
          setIsAdmin(false);
          setIsAuthenticated(false);
          setUserId(null);
          setLoading(false);
        }
        return;
      }
      
      if (mounted) {
        setIsAuthenticated(true);
        setUserId(uid);
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();

      if (mounted) {
        setIsAdmin(!!data);
        setLoading(false);
      }
    };

    // Wait for session to restore from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAdmin(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setLoading(true);
      checkAdmin(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading, userId, isAuthenticated };
}

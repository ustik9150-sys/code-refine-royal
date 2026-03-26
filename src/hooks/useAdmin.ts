import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const retryRef = useRef(0);

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

      // Query with retry for cases where token just refreshed
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && mounted) {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid)
          .eq("role", "admin")
          .maybeSingle();

        if (!error) {
          if (mounted) {
            setIsAdmin(!!data);
            setLoading(false);
          }
          return;
        }

        // If permission/auth error, wait and retry
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 500 * attempts));
          // Refresh session before retrying
          await supabase.auth.getSession();
        }
      }

      // All retries failed — still set state
      if (mounted) {
        setIsAdmin(false);
        setLoading(false);
      }
    };

    // IMPORTANT: Set up listener BEFORE getSession to avoid missing events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setLoading(true);
      checkAdmin(session?.user?.id ?? null);
    });

    // Then check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        checkAdmin(session?.user?.id ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading, userId, isAuthenticated };
}

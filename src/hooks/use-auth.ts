import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: User; session: Session }
  | { status: "unauthenticated" };

/**
 * Reactive auth state hook.
 * Returns { status: 'loading' } while Supabase resolves the session,
 * then 'authenticated' or 'unauthenticated'.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    // Get current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setState({ status: "authenticated", user: session.user, session });
      } else {
        setState({ status: "unauthenticated" });
      }
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setState({ status: "authenticated", user: session.user, session });
      } else {
        setState({ status: "unauthenticated" });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

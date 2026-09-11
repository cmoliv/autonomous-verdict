import { useEffect, useState } from "react";

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: any; session: any }
  | { status: "unauthenticated" };

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    // Simple mock auth for local non-commercial usage
    const isMockAdmin = localStorage.getItem("mock_admin_auth") === "true";
    
    if (isMockAdmin) {
      setState({ 
        status: "authenticated", 
        user: { email: "admin@email.com" }, 
        session: { access_token: "mock-token" } 
      });
    } else {
      setState({ status: "unauthenticated" });
    }
    
    // Listen for custom events if needed, but for now a reload works or we can trigger event
    const handleAuthChange = () => {
      if (localStorage.getItem("mock_admin_auth") === "true") {
        setState({ status: "authenticated", user: { email: "admin@email.com" }, session: { access_token: "mock-token" } });
      } else {
        setState({ status: "unauthenticated" });
      }
    };

    window.addEventListener("mock_auth_change", handleAuthChange);
    return () => window.removeEventListener("mock_auth_change", handleAuthChange);
  }, []);

  return state;
}

export const mockSignIn = (email, password) => {
  if (email === "admin@email.com" && password === "adminpassword123") {
    localStorage.setItem("mock_admin_auth", "true");
    document.cookie = "mock_admin_auth=true; path=/;"; // Also set cookie for server-side auth
    window.dispatchEvent(new Event("mock_auth_change"));
    return { error: null };
  }
  return { error: { message: "Credenciais inválidas" } };
};

export const mockSignOut = () => {
  localStorage.removeItem("mock_admin_auth");
  document.cookie = "mock_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  window.dispatchEvent(new Event("mock_auth_change"));
};

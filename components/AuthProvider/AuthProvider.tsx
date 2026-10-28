"use client";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { checkSession, getMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  useEffect(() => {
    let active = true;
    const revision = useAuthStore.getState().revision;
    async function restore() {
      try {
        const user = await queryClient.fetchQuery({
          queryKey: ["auth", "session"],
          queryFn: async ({ signal }) =>
            (await checkSession(signal)) ? getMe(signal) : null,
          staleTime: 0,
          retry: false,
        });
        if (active && revision === useAuthStore.getState().revision) {
          if (user) useAuthStore.getState().setUser(user);
          else useAuthStore.getState().clearIsAuthenticated();
        }
      } catch {
        if (active && revision === useAuthStore.getState().revision)
          useAuthStore.getState().clearIsAuthenticated();
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, [queryClient]);
  return children;
}

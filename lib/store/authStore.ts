import { create } from "zustand";
import type { User } from "@/types/user";
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  revision: number;
  setUser: (user: User) => void;
  clearIsAuthenticated: () => void;
}
export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  revision: 0,
  setUser: (user) =>
    set((state) => ({
      user,
      isAuthenticated: true,
      revision: state.revision + 1,
    })),
  clearIsAuthenticated: () =>
    set((state) => ({
      user: null,
      isAuthenticated: false,
      revision: state.revision + 1,
    })),
}));

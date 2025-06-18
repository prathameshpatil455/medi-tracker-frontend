declare module "../context/AuthContext" {
  export interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
    error: string | null;
    loading: boolean;
  }

  export const useAuth: () => AuthContextType;
}

declare module "../hooks/useNotifications" {
  export const useNotifications: () => {
    requestNotificationPermissions: () => Promise<void>;
  };
}

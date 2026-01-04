"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt?: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  
  // Social auth
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  
  // Helpers
  refreshSession: () => Promise<void>;
}

/**
 * Authentication hook
 * 
 * Provides auth state and actions. Connect to your auth provider
 * (Supabase, Clerk, Auth0, NextAuth, etc.)
 * 
 * @example
 * ```tsx
 * const { user, isLoading, login, logout } = useAuth();
 * 
 * if (isLoading) return <Spinner />;
 * if (!user) return <LoginForm onSubmit={login} />;
 * 
 * return <Dashboard user={user} onLogout={logout} />;
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // TODO: Check for existing session
        // const session = await authClient.getSession();
        // if (session?.user) {
        //   setState({
        //     user: session.user,
        //     isLoading: false,
        //     isAuthenticated: true,
        //   });
        // } else {
        //   setState({ user: null, isLoading: false, isAuthenticated: false });
        // }
        
        // Placeholder: Set as not authenticated
        setState({ user: null, isLoading: false, isAuthenticated: false });
      } catch (error) {
        console.error("Auth initialization error:", error);
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      // TODO: Implement with your auth provider
      // const { user } = await authClient.signIn({ email, password });
      // setState({ user, isLoading: false, isAuthenticated: true });
      
      throw new Error("Connect your auth provider in useAuth hook");
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      // TODO: Implement with your auth provider
      // const { user } = await authClient.signUp({ email, password, name });
      // setState({ user, isLoading: false, isAuthenticated: true });
      
      throw new Error("Connect your auth provider in useAuth hook");
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      // TODO: Implement with your auth provider
      // await authClient.signOut();
      
      setState({ user: null, isLoading: false, isAuthenticated: false });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    // TODO: Implement with your auth provider
    // await authClient.resetPassword({ email });
    throw new Error("Connect your auth provider in useAuth hook");
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    // TODO: Implement with your auth provider
    // await authClient.updatePassword({ password: newPassword });
    throw new Error("Connect your auth provider in useAuth hook");
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    // TODO: Implement with your auth provider
    // const user = await authClient.updateUser(data);
    // setState((prev) => ({ ...prev, user }));
    throw new Error("Connect your auth provider in useAuth hook");
  }, []);

  const loginWithGoogle = useCallback(async () => {
    // TODO: Implement with your auth provider
    // await authClient.signInWithOAuth({ provider: 'google' });
    throw new Error("Connect your auth provider in useAuth hook");
  }, []);

  const loginWithGitHub = useCallback(async () => {
    // TODO: Implement with your auth provider
    // await authClient.signInWithOAuth({ provider: 'github' });
    throw new Error("Connect your auth provider in useAuth hook");
  }, []);

  const refreshSession = useCallback(async () => {
    // TODO: Implement with your auth provider
    // const { user } = await authClient.refreshSession();
    // setState({ user, isLoading: false, isAuthenticated: !!user });
    throw new Error("Connect your auth provider in useAuth hook");
  }, []);

  return {
    ...state,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    loginWithGoogle,
    loginWithGitHub,
    refreshSession,
  };
}


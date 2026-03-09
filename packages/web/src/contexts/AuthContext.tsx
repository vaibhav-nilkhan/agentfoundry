'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // For V2 Solo Mode, we default to no logged-in user until we implement Native Auth
  const [user] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const signOut = async () => {
    console.log('Sign out called in Solo Mode');
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

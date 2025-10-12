import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [location] = useLocation();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [location]);

  const signOut = async () => {
    // Save current state in case we need to restore it
    const previousUser = user;
    const previousSession = session;
    
    // Optimistically clear state for immediate UI update
    setUser(null);
    setSession(null);
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Restore previous state if signOut fails
      setUser(previousUser);
      setSession(previousSession);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

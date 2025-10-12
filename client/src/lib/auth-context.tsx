import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  // Only run effect once on mount
  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    setLoading(true);
    setAuthError(null);

    // Timeout for session fetch (10s)
    timeoutId = setTimeout(() => {
      if (isMounted) {
        setAuthError('Session fetch timed out. Check your Supabase config and network.');
        setLoading(false);
      }
    }, 10000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      })
      .catch((err) => {
        if (!isMounted) return;
        setAuthError('Failed to fetch session: ' + (err?.message || String(err)));
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setAuthError(null);
    });

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Save current state in case we need to restore it
    const previousUser = user;
    const previousSession = session;
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      setUser(previousUser);
      setSession(previousSession);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, authError, signOut }}>
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

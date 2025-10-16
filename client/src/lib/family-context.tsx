import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { authenticatedFetch } from './api';

interface FamilyMember {
  id: string;
  name: string;
  color?: string;
  role: string;
}

interface Family {
  id: string;
  name: string;
  invite_code?: string;
  created_at: string;
}

interface FamilyContextType {
  family: Family | null;
  members: FamilyMember[];
  loading: boolean;
  error: string | null;
  refreshFamily: () => Promise<void>;
  lastUpdated: number;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

interface FamilyProviderProps {
  children: ReactNode;
}

export function FamilyProvider({ children }: FamilyProviderProps) {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const loadFamilyData = async (forceRefresh = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check if we need to refresh based on cache
    const now = Date.now();
    if (!forceRefresh && lastUpdated && (now - lastUpdated) < CACHE_DURATION && family && members.length > 0) {
      console.log('Using cached family data from context');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch family and members in parallel
      const [familyResponse, membersResponse] = await Promise.all([
        authenticatedFetch('/api/families'),
        authenticatedFetch('/api/family-members')
      ]);

      if (familyResponse.ok) {
        const families = await familyResponse.json();
        if (families.length > 0) {
          setFamily(families[0].family);
        }
      } else {
        throw new Error('Failed to load family data');
      }

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData);
      } else {
        throw new Error('Failed to load family members');
      }

      setLastUpdated(now);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family data');
      console.error('Error loading family data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshFamily = async () => {
    await loadFamilyData(true);
  };

  useEffect(() => {
    loadFamilyData();
  }, [user]);

  const value: FamilyContextType = {
    family,
    members,
    loading,
    error,
    refreshFamily,
    lastUpdated,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
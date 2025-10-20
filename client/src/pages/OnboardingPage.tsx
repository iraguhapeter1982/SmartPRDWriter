import OnboardingWizard from '@/components/OnboardingWizard';
import { useAuth } from '@/lib/auth-context';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  const handleComplete = () => {
    // Redirect will happen automatically via auth state change
    // This is just a fallback
    setLocation('/');
  };

  return <OnboardingWizard onComplete={handleComplete} />;
}
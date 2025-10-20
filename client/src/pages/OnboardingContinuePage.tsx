import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import OnboardingWizard from '@/components/OnboardingWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function OnboardingContinuePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      // Check if user came from email verification
      const urlParams = new URLSearchParams(window.location.search);
      const step = urlParams.get('step');
      
      if (step === 'profile-setup' && user) {
        // User has verified email and is authenticated
        setVerificationComplete(true);
        setIsVerifying(false);
      } else if (user) {
        // User is authenticated but didn't come from verification
        // Redirect to dashboard
        setLocation('/');
      } else {
        // User not authenticated, redirect to login
        setLocation('/login');
      }
    };

    // Small delay to ensure auth state is settled
    const timer = setTimeout(checkVerificationStatus, 1000);
    return () => clearTimeout(timer);
  }, [user, setLocation]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h2 className="text-lg font-semibold mb-2">Verifying your email...</h2>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we confirm your email verification.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <CardTitle>Email Verified!</CardTitle>
              <CardDescription>
                Great! Your email has been confirmed. Let's complete your profile setup.
              </CardDescription>
            </CardHeader>
          </Card>
          
          {/* Continue with onboarding wizard starting from step 3 */}
          <OnboardingWizard 
            initialStep={3} 
            onComplete={() => setLocation('/')}
          />
        </div>
      </div>
    );
  }

  return null;
}
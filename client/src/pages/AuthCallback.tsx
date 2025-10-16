import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          // Get pending signup data
          const pendingSignup = localStorage.getItem('pendingSignup');
          
          if (pendingSignup) {
            const signupData = JSON.parse(pendingSignup);
            
            // Complete the user setup
            const response = await fetch('/api/auth/complete-signup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.session.access_token}`
              },
              body: JSON.stringify(signupData)
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to complete signup');
            }

            localStorage.removeItem('pendingSignup');
            
            setStatus('success');
            setMessage('Account confirmed successfully! Redirecting to your dashboard...');
            
            toast({
              title: "Welcome!",
              description: signupData.isNewFamily 
                ? "Your account has been confirmed and your family has been created."
                : "Your account has been confirmed and you've been added to the family."
            });

            setTimeout(() => {
              setLocation('/');
            }, 2000);
          } else {
            // Regular login confirmation
            setStatus('success');
            setMessage('Email confirmed! Redirecting...');
            setTimeout(() => {
              setLocation('/');
            }, 1500);
          }
        } else {
          throw new Error('No session found after email confirmation');
        }
        
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Failed to confirm email. Please try again.');
        
        toast({
          title: "Confirmation Error",
          description: error.message || "Failed to confirm email. Please try again.",
          variant: "destructive"
        });

        setTimeout(() => {
          setLocation('/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        )}
        {status === 'success' && (
          <div className="w-12 h-12 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        )}
        {status === 'error' && (
          <div className="w-12 h-12 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        )}
        <p className="text-lg font-medium">{message}</p>
        {status === 'error' && (
          <p className="text-sm text-muted-foreground mt-2">
            You will be redirected to the login page shortly.
          </p>
        )}
      </div>
    </div>
  );
}
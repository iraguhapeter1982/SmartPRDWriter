import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useLocation } from 'wouter';
import { Loader2, Mail, CheckCircle, User, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OnboardingData {
  email: string;
  fullName: string;
  password: string;
  avatar?: string;
  familyName: string;
  familyMembers: Array<{
    name: string;
    role: 'parent' | 'child' | 'teen';
    email?: string;
  }>;
}

interface OnboardingWizardProps {
  onComplete?: () => void;
  initialStep?: number;
}

export default function OnboardingWizard({ onComplete, initialStep = 1 }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    email: '',
    fullName: '',
    password: '',
    familyName: '',
    familyMembers: []
  });

  // Email verification state
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Progress calculation
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    let isValid = false;
    
    switch (step) {
      case 1:
        isValid = !!onboardingData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(onboardingData.email);
        break;
      case 2:
        // Email verification step - user needs to check email
        isValid = verificationSent;
        break;
      case 3:
        isValid = !!onboardingData.fullName && 
               onboardingData.fullName.trim().length >= 2 && 
               !!onboardingData.password && 
               onboardingData.password.length >= 6;
        break;
      case 4:
        isValid = !!onboardingData.familyName && onboardingData.familyName.trim().length >= 2;
        break;
      default:
        isValid = false;
    }
    
    console.log(`Step ${step} validation:`, {
      isValid,
      email: onboardingData.email,
      fullName: onboardingData.fullName,
      password: onboardingData.password ? '*'.repeat(onboardingData.password.length) : '',
      familyName: onboardingData.familyName,
      verificationSent
    });
    
    return isValid;
  };

  const handleNextStep = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === 1) {
      await handleEmailSubmit();
    } else if (currentStep === 4) {
      await handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleEmailSubmit = async () => {
    setIsLoading(true);
    try {
      // Note: We rely on Supabase to handle duplicate email detection during signup
      // since admin.listUsers() requires admin privileges that client doesn't have

      // Create Supabase user with email/password - this triggers verification email
      const { data, error } = await supabase.auth.signUp({
        email: onboardingData.email,
        password: 'temporary-password-will-be-reset', // Temporary password
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding/continue?step=profile-setup`,
          data: {
            onboarding_step: 'email_verified'
          }
        }
      });

      if (error) {
        // Handle Supabase specific errors
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw error;
      }

      // Store onboarding data for later completion
      const tempOnboardingData = {
        email: onboardingData.email,
        userId: data.user?.id
      };
      localStorage.setItem('onboardingData', JSON.stringify(tempOnboardingData));

      setVerificationSent(true);
      setCurrentStep(2);
      
      toast({
        title: "Check your email",
        description: `We've sent a verification link to ${onboardingData.email}`
      });
    } catch (error: any) {
      if (error.message.includes('already exists') || error.message.includes('already registered')) {
        toast({
          title: "Email Already Exists",
          description: "An account with this email already exists.",
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/login')}
            >
              Sign In Instead
            </Button>
          )
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      // Resend verification email through Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: onboardingData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding/continue?step=profile-setup`
        }
      });

      if (error) throw error;

      setResendCooldown(60);
      
      toast({
        title: "Email sent",
        description: `Verification email resent to ${onboardingData.email}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Get current user session (should exist after email verification)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Please verify your email first');
      }

      // Update user profile with real data
      const { error: updateError } = await supabase.auth.updateUser({
        password: onboardingData.password,
        data: {
          full_name: onboardingData.fullName,
          family_name: onboardingData.familyName,
          onboarding_completed: true
        }
      });

      if (updateError) throw updateError;

      // Store family creation data for server-side processing
      const familyData = {
        familyName: onboardingData.familyName,
        familyMembers: onboardingData.familyMembers,
        isNewFamily: true,
        userId: session.user.id
      };
      
      // Send to server to create family and members
      const response = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(familyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete setup');
      }

      // Clean up temporary data
      localStorage.removeItem('onboardingData');

      toast({
        title: "Success!",
        description: "Your family hub has been created successfully!"
      });

      // Redirect will happen automatically via auth state change
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <EmailCaptureStep />;
      case 2:
        return <EmailVerificationStep />;
      case 3:
        return <ProfileSetupStep />;
      case 4:
        return <FamilyCreationStep />;
      default:
        return null;
    }
  };

  const EmailCaptureStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Mail className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">Let's get started</h2>
        <p className="text-muted-foreground">
          Enter your email to create your family command center
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            autoFocus
            value={onboardingData.email}
            onChange={(e) => updateOnboardingData({ email: e.target.value })}
            className={
              onboardingData.email 
                ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(onboardingData.email) ? 'border-green-500' : 'border-red-500')
                : ''
            }
          />
          {onboardingData.email && (
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(onboardingData.email) ? (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Valid email address
              </p>
            ) : (
              <p className="text-xs text-red-500">
                Please enter a valid email address
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );

  const EmailVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold">Check your email</h2>
        <p className="text-muted-foreground">
          We've sent a verification link to:
        </p>
        <p className="font-medium text-foreground">{onboardingData.email}</p>
      </div>
      
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Click the link in your email to verify your account, then continue here.
        </p>
        
        <Button
          variant="outline"
          onClick={handleResendVerification}
          disabled={resendCooldown > 0 || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
        </Button>
      </div>
    </div>
  );

  const ProfileSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <User className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">Create your profile</h2>
        <p className="text-muted-foreground">
          Almost done! Tell us about yourself.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            placeholder="Your full name"
            value={onboardingData.fullName}
            onChange={(e) => updateOnboardingData({ fullName: e.target.value })}
            className={onboardingData.fullName && onboardingData.fullName.trim().length < 2 ? 'border-red-500' : ''}
          />
          {onboardingData.fullName && onboardingData.fullName.trim().length < 2 && (
            <p className="text-xs text-red-500">
              Full name must be at least 2 characters long
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a secure password"
            value={onboardingData.password}
            onChange={(e) => updateOnboardingData({ password: e.target.value })}
            className={onboardingData.password && onboardingData.password.length < 6 ? 'border-red-500' : ''}
          />
          <p className={`text-xs ${onboardingData.password && onboardingData.password.length < 6 ? 'text-red-500' : 'text-muted-foreground'}`}>
            Must be at least 6 characters long
            {onboardingData.password && ` (${onboardingData.password.length}/6)`}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>Avatar (optional)</Label>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={onboardingData.avatar} />
              <AvatarFallback>
                {onboardingData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              Choose photo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const FamilyCreationStep = () => {
    const addFamilyMember = () => {
      updateOnboardingData({
        familyMembers: [
          ...onboardingData.familyMembers,
          { name: '', role: 'child' as const }
        ]
      });
    };

    const updateFamilyMember = (index: number, updates: Partial<typeof onboardingData.familyMembers[0]>) => {
      const updatedMembers = [...onboardingData.familyMembers];
      updatedMembers[index] = { ...updatedMembers[index], ...updates };
      updateOnboardingData({ familyMembers: updatedMembers });
    };

    const removeFamilyMember = (index: number) => {
      const updatedMembers = onboardingData.familyMembers.filter((_, i) => i !== index);
      updateOnboardingData({ familyMembers: updatedMembers });
    };

    // Auto-generate family name default
    useEffect(() => {
      if (onboardingData.fullName && !onboardingData.familyName) {
        const firstName = onboardingData.fullName.split(' ')[0];
        updateOnboardingData({ familyName: `${firstName} Family` });
      }
    }, [onboardingData.fullName]);

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Users className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Create your family</h2>
          <p className="text-muted-foreground">
            Set up your family and add members
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="familyName">Family name</Label>
            <Input
              id="familyName"
              placeholder="Enter your family name"
              value={onboardingData.familyName}
              onChange={(e) => updateOnboardingData({ familyName: e.target.value })}
              className={onboardingData.familyName && onboardingData.familyName.trim().length < 2 ? 'border-red-500' : ''}
            />
            {onboardingData.familyName && onboardingData.familyName.trim().length < 2 && (
              <p className="text-xs text-red-500">
                Family name must be at least 2 characters long
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <Label>Family members (optional)</Label>
            <p className="text-sm text-muted-foreground">
              Add family members now or invite them later
            </p>
            
            {onboardingData.familyMembers.map((member, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    placeholder="Member name"
                    value={member.name}
                    onChange={(e) => updateFamilyMember(index, { name: e.target.value })}
                  />
                </div>
                <div className="w-32">
                  <Select
                    value={member.role}
                    onValueChange={(value: 'parent' | 'child' | 'teen') => 
                      updateFamilyMember(index, { role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="teen">Teen</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFamilyMember(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addFamilyMember}
              className="w-full"
            >
              Add family member
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <CardTitle className="text-center">Family Command Center</CardTitle>
          <CardDescription className="text-center">
            Create your family's digital headquarters
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex gap-3">
            {currentStep > 1 && currentStep !== 2 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            <Button
              onClick={handleNextStep}
              disabled={!validateStep(currentStep) || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {currentStep === totalSteps ? 'Complete Setup' : 'Continue'}
            </Button>
          </div>
          
          {currentStep === 1 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button variant="ghost" className="p-0 h-auto underline text-primary" onClick={() => setLocation('/login')}>
                  Sign in
                </Button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
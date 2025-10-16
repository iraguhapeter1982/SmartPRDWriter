import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Pre-fill email if coming from invitation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            family_name: familyName,
            full_name: familyName + " Admin",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) throw error;

      // Store signup data for post-confirmation processing
      if (data.user) {
        const signupData: {
          userId: string;
          familyName: string;
          email: string;
          isNewFamily: boolean;
          inviteToken?: string;
        } = {
          userId: data.user.id,
          familyName: familyName,
          email: email,
          isNewFamily: true
        };

        // Check for pending invite
        const pendingInvite = localStorage.getItem("pendingInvite");
        if (pendingInvite) {
          signupData.isNewFamily = false;
          signupData.inviteToken = pendingInvite;
          localStorage.removeItem("pendingInvite");
        }

        localStorage.setItem('pendingSignup', JSON.stringify(signupData));
      }

      // Never redirect to dashboard - always show email confirmation message
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link. Please click it to activate your account and complete your setup.",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Family Account</CardTitle>
          <CardDescription>Get started with family management</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                type="text"
                placeholder="The Smith Family"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
                data-testid="input-family-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                data-testid="input-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                data-testid="input-confirm-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-signup">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => setLocation("/login")}
              >
                Sign in
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

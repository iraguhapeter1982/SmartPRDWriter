import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AcceptInvitePage() {
  const [, params] = useRoute("/accept-invite/:token");
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, authError } = useAuth();
  const [invite, setInvite] = useState<any>(null);
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadInvite = async () => {
      if (!params?.token) return;

      try {
        // Server-side validation of invite token
        const response = await fetch(`/api/invites/${params.token}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || "Invalid or expired invite");
        }
        
        const data = await response.json();
        setInvite(data.invite);
        setFamily(data.family);
        setError(null);
      } catch (error: any) {
        console.error('Invite validation error:', error);
        setError(error.message);
        toast({
          title: "Invalid Invitation",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [params?.token, toast]);

  const handleAccept = async () => {
    if (!user) {
      // Store invite token and redirect to signup with pre-filled email
      localStorage.setItem("pendingInvite", params?.token || "");
      const signupUrl = `/signup${invite?.email ? `?email=${encodeURIComponent(invite.email)}` : ''}`;
      setLocation(signupUrl);
      return;
    }

    setAccepting(true);
    try {
      // For existing users, we need to join them to the family
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        throw new Error("Please log in to accept this invitation");
      }

      const response = await fetch(`/api/invites/${params?.token}/accept`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to accept invite");
      }

      toast({
        title: "Success",
        description: `You've successfully joined ${family?.name}!`,
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading invitation...</p>
          {authError && (
            <p className="mt-2 text-red-500 text-sm">{authError}</p>
          )}
        </div>
      </div>
    );
  }

  if (error || !invite || !family) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              {error || "This invitation link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")} 
              className="w-full"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Family Invite</CardTitle>
          <CardDescription>
            You've been invited to join {family.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              <strong>{invite.email}</strong> has been invited to join this family.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Invitation expires: {new Date(invite.expires_at).toLocaleDateString()}
            </p>
          </div>
          
          {user ? (
            <div className="space-y-3">
              {user.email === invite.email ? (
                <Button onClick={handleAccept} className="w-full" disabled={accepting}>
                  {accepting ? "Joining Family..." : "Accept Invitation"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    You're logged in as {user.email}, but this invitation is for {invite.email}.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      localStorage.setItem("pendingInvite", params?.token || "");
                      setLocation("/login");
                    }} 
                    className="w-full"
                  >
                    Login as {invite.email}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                To accept this invitation, you need to create an account or sign in.
              </p>
              <div className="space-y-2">
                <Button onClick={handleAccept} className="w-full">
                  Create Account for {invite.email}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.setItem("pendingInvite", params?.token || "");
                    setLocation("/login");
                  }}
                  className="w-full"
                >
                  I already have an account
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

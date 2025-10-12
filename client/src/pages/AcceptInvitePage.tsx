import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { authenticatedFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AcceptInvitePage() {
  const [, params] = useRoute("/accept-invite/:token");
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [invite, setInvite] = useState<any>(null);
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadInvite = async () => {
      if (!params?.token) return;

      try {
        const response = await fetch(`/api/invites/${params.token}`);
        if (!response.ok) {
          throw new Error("Invalid or expired invite");
        }
        const data = await response.json();
        setInvite(data.invite);
        setFamily(data.family);
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

    loadInvite();
  }, [params?.token, toast]);

  const handleAccept = async () => {
    if (!user) {
      localStorage.setItem("pendingInvite", params?.token || "");
      setLocation("/signup");
      return;
    }

    setAccepting(true);
    try {
      const response = await authenticatedFetch(`/api/invites/${params?.token}/accept`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to accept invite");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: "You've joined the family!",
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
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!invite || !family) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>
              This invite link is invalid or has expired.
            </CardDescription>
          </CardHeader>
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
          <p className="text-sm text-muted-foreground mb-4">
            {invite.email} has been invited to this family.
          </p>
          {user ? (
            <Button onClick={handleAccept} className="w-full" disabled={accepting}>
              {accepting ? "Accepting..." : "Accept Invite"}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button onClick={handleAccept} className="w-full">
                Sign Up to Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.setItem("pendingInvite", params?.token || "");
                  setLocation("/login");
                }}
                className="w-full"
              >
                Already have an account? Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

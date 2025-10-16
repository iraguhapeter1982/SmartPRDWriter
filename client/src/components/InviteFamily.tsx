import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useFamily } from "@/lib/family-context";
import { authenticatedFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface InviteFamilyProps {
  familyId: string;
}

export default function InviteFamily({ familyId }: InviteFamilyProps) {
  const { user } = useAuth();
  const { refreshFamily } = useFamily();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await authenticatedFetch("/api/invites", {
        method: "POST",
        body: JSON.stringify({
          familyId,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invite");
      }

      const invite = await response.json();
      const inviteLink = `${window.location.origin}/accept-invite/${invite.token}`;

      toast({
        title: "Invite Sent!",
        description: `Copy this link to share: ${inviteLink}`,
      });

      setEmail("");
      
      // Refresh family data to show any updates
      await refreshFamily();
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
    <Card>
      <CardHeader>
        <CardTitle>Invite Family Member</CardTitle>
        <CardDescription>
          Send an invitation to add someone to your family
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Invite"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

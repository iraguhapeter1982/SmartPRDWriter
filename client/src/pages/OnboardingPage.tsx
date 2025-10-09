import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Users, UserPlus } from 'lucide-react';

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { refreshUser, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard when user has familyId
  useEffect(() => {
    if (!authLoading && user?.familyId) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest('POST', '/api/families', { name: familyName });
      const family = await response.json();
      
      await refreshUser();
      
      toast({
        title: 'Family Created!',
        description: `Your invite code is: ${family.inviteCode}. Share it with family members.`,
      });
      
      // Redirect will happen via useEffect when user state updates
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiRequest('POST', '/api/families/join', { inviteCode: inviteCode.toUpperCase() });
      await refreshUser();
      
      toast({
        title: 'Success!',
        description: 'You have joined the family.',
      });
      
      // Redirect will happen via useEffect when user state updates
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to Family Command Center</CardTitle>
          <CardDescription>Create a new family or join an existing one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" data-testid="tab-create-family">
                <Users className="w-4 h-4 mr-2" />
                Create Family
              </TabsTrigger>
              <TabsTrigger value="join" data-testid="tab-join-family">
                <UserPlus className="w-4 h-4 mr-2" />
                Join Family
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="mt-6">
              <form onSubmit={handleCreateFamily} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familyName">Family Name</Label>
                  <Input
                    id="familyName"
                    type="text"
                    placeholder="The Smiths"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    required
                    data-testid="input-family-name"
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose a name for your family. You'll get an invite code to share with others.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-create-family">
                  {loading ? 'Creating...' : 'Create Family'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="join" className="mt-6">
              <form onSubmit={handleJoinFamily} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    placeholder="ABCD1234"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    required
                    maxLength={8}
                    data-testid="input-invite-code"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the invite code you received from a family member.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-join-family">
                  {loading ? 'Joining...' : 'Join Family'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Settings, Calendar, CreditCard, Users, Bell, Mail, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import FamilyMemberDialog from '@/components/FamilyMemberDialog';
import calendarSyncImage from '@assets/generated_images/Calendar_sync_integration_illustration_f7363b08.png';

type FamilyMember = {
  id: string;
  familyId: string;
  name: string;
  role: string | null;
  birthYear: number | null;
  color: string | null;
  avatarUrl: string | null;
};

type Family = {
  id: string;
  name: string;
  inviteCode: string | null;
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | undefined>();

  const { data: family } = useQuery<Family>({
    queryKey: ['/api/families/current'],
  });

  const { data: members = [], isLoading } = useQuery<FamilyMember[]>({
    queryKey: ['/api/family-members'],
    enabled: !!user?.familyId,
  });

  const { data: calendarConnections = [] } = useQuery<any[]>({
    queryKey: ['/api/calendar-connections'],
  });

  const connectCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/calendar-connections/google');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-connections'] });
      toast({
        title: 'Success',
        description: 'Google Calendar connected successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const syncCalendarMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await apiRequest('POST', `/api/calendar-connections/${connectionId}/sync`);
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Sync Complete',
        description: `Synced ${data.syncedCount} new events from ${data.totalEvents} total`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Sync Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await apiRequest('DELETE', `/api/family-members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-members'] });
      toast({
        title: 'Success',
        description: 'Family member removed',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (member: FamilyMember) => {
    setSelectedMember(member);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedMember(undefined);
    setDialogOpen(true);
  };

  const handleDelete = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this family member?')) {
      deleteMutation.mutate(memberId);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6" data-testid="page-settings">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Family Profile
            </CardTitle>
            <CardDescription>Manage your family information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="family-name">Family Name</Label>
              <Input 
                id="family-name"
                value={family?.name || ''}
                disabled
                data-testid="input-family-name"
              />
              <p className="text-xs text-muted-foreground">
                Invite Code: <span className="font-mono">{family?.inviteCode}</span>
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label>Family Members</Label>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading members...</div>
              ) : members.length === 0 ? (
                <div className="text-sm text-muted-foreground">No family members yet</div>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-md hover-elevate">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback 
                          style={{ backgroundColor: member.color || 'hsl(210, 70%, 55%)' }} 
                          className="text-white text-xs"
                        >
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role || 'Member'}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(member)}
                        data-testid={`button-edit-${member.id}`}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(member.id)}
                        data-testid={`button-delete-${member.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleAdd}
                data-testid="button-add-member"
              >
                Add Member
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar Integration
            </CardTitle>
            <CardDescription>Connect your Google Calendar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
              <img 
                src={calendarSyncImage} 
                alt="Calendar Sync" 
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <div className="space-y-3">
              {calendarConnections.length > 0 ? (
                <>
                  {calendarConnections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-3 rounded-md bg-card border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {connection.googleAccountEmail ? getInitials(connection.googleAccountEmail) : 'GC'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{connection.googleAccountEmail || 'Google Calendar'}</p>
                          <p className="text-xs text-muted-foreground">
                            {connection.lastSyncedAt 
                              ? `Last synced: ${new Date(connection.lastSyncedAt).toLocaleDateString()}`
                              : 'Not synced yet'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Active</Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => syncCalendarMutation.mutate(connection.id)}
                          disabled={syncCalendarMutation.isPending}
                          data-testid="button-sync-calendar"
                        >
                          {syncCalendarMutation.isPending ? 'Syncing...' : 'Sync Now'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-md bg-card border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        GC
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Google Calendar</p>
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Inactive</Badge>
                </div>
              )}
              
              {calendarConnections.length === 0 && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => connectCalendarMutation.mutate()}
                  disabled={connectCalendarMutation.isPending}
                  data-testid="button-connect-calendar"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {connectCalendarMutation.isPending ? 'Connecting...' : 'Connect Google Calendar'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Urgent Messages</p>
                <p className="text-xs text-muted-foreground">Get alerts for urgent school messages</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Chore Reminders</p>
                <p className="text-xs text-muted-foreground">Daily reminders for pending chores</p>
              </div>
              <Button variant="outline" size="sm">Disabled</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              School Email Forwarding
            </CardTitle>
            <CardDescription>Forward school emails to this address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-md bg-muted border-2 border-dashed">
              <p className="text-sm font-mono break-all" data-testid="text-forwarding-email">
                {family?.inviteCode?.toLowerCase()}-family@familycmd.app
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Forward school emails to this address and they will automatically appear in your School Hub.
            </p>
            <Button variant="outline" className="w-full">Copy Address</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription & Billing
            </CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
              <div>
                <p className="font-semibold">Premium Plan</p>
                <p className="text-sm text-muted-foreground">Unlimited calendars, lists, and chores</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">$9.99</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline">Manage Subscription</Button>
              <Button variant="outline">View Billing History</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <FamilyMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={selectedMember}
        familyId={user?.familyId || ''}
      />
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Settings, Calendar, CreditCard, Users, Bell, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useFamily } from '@/lib/family-context';
import { authenticatedFetch } from '@/lib/api';
import InviteFamily from '@/components/InviteFamily';
import calendarSyncImage from '@assets/generated_images/Calendar_sync_integration_illustration_f7363b08.png';

export default function SettingsPage() {
  const { user } = useAuth();
  const { family: userFamily, members: familyMembers, loading: loadingMembers, refreshFamily } = useFamily();
  const [familyName, setFamilyName] = useState('Johnson Family');

  useEffect(() => {
    if (userFamily?.name) {
      setFamilyName(userFamily.name);
    }
  }, [userFamily]);

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
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                data-testid="input-family-name"
              />
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label>Family Members</Label>
              <div className="space-y-2">
                {loadingMembers ? (
                  <div className="flex items-center gap-3 p-2 rounded-md">
                    <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-16"></div>
                    </div>
                  </div>
                ) : familyMembers.length > 0 ? (
                  familyMembers.map((member) => {
                    // Generate initials from name
                    const initials = member.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    
                    // Use member color or generate a default
                    const backgroundColor = member.color || `hsl(${Math.abs(member.name.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)) % 360}, 65%, 55%)`;
                    
                    return (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-md hover-elevate">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback style={{ backgroundColor }} className="text-white text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role || 'Member'}</p>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No family members found</p>
                    <p className="text-xs">Invite family members to get started</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {userFamily && (
          <Card>
            <InviteFamily familyId={userFamily.id} />
          </Card>
        )}

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
              <div className="flex items-center justify-between p-3 rounded-md bg-card border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">sarah.johnson@gmail.com</p>
                    <p className="text-xs text-muted-foreground">Connected</p>
                  </div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              
              <Button variant="outline" className="w-full" data-testid="button-connect-calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Connect Another Calendar
              </Button>
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
                johnson-family-abc123@familycmd.app
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Forward school emails to this address and they will automatically appear in your School Hub.
            </p>
            <Button variant="outline" className="w-full">Copy Address</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

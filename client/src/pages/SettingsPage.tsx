import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Settings, Calendar, CreditCard, Users, Bell, Mail } from 'lucide-react';
import { useState } from 'react';
import calendarSyncImage from '@assets/generated_images/Calendar_sync_integration_illustration_f7363b08.png';

export default function SettingsPage() {
  const [familyName, setFamilyName] = useState('Johnson Family');

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
                {[
                  { name: 'Sarah Johnson', initials: 'SJ', color: 'hsl(30, 75%, 55%)', role: 'Parent' },
                  { name: 'Mike Johnson', initials: 'MJ', color: 'hsl(150, 60%, 50%)', role: 'Parent' },
                  { name: 'Emma Johnson', initials: 'EM', color: 'hsl(270, 65%, 60%)', role: 'Child' },
                  { name: 'Lucas Johnson', initials: 'LJ', color: 'hsl(340, 70%, 58%)', role: 'Child' }
                ].map((member) => (
                  <div key={member.name} className="flex items-center gap-3 p-2 rounded-md hover-elevate">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback style={{ backgroundColor: member.color }} className="text-white text-xs">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" data-testid="button-add-member">
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
    </div>
  );
}

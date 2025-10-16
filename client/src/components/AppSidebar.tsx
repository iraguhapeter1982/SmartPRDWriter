import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Home, Calendar, ShoppingCart, CheckSquare, Mail, Settings, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useFamily } from '@/lib/family-context';

const menuItems = [
  { title: 'Dashboard', icon: Home, path: '/' },
  { title: 'Calendar', icon: Calendar, path: '/calendar' },
  { title: 'Lists', icon: ShoppingCart, path: '/lists' },
  { title: 'Chores', icon: CheckSquare, path: '/chores' },
  { title: 'School Hub', icon: Mail, path: '/school' },
];

export default function AppSidebar() {
  const [location] = useLocation();
  const { family: userFamily, members: familyMembers, loading: loadingFamily } = useFamily();

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">
              {loadingFamily ? 'Loading...' : userFamily?.name || 'Your Family'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {loadingFamily ? '...' : `${familyMembers.length} member${familyMembers.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location === item.path}
                    data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <a href={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Family Members</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2">
              {loadingFamily ? (
                // Loading skeleton
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-md">
                    <div className="h-6 w-6 bg-muted rounded-full animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
                  </div>
                ))
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
                  
                  // Get first name for display
                  const firstName = member.name.split(' ')[0];
                  
                  return (
                    <div key={member.id} className="flex items-center gap-2 p-2 rounded-md hover-elevate">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback style={{ backgroundColor }} className="text-white text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{firstName}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-2 py-4 text-center">
                  <p className="text-xs text-muted-foreground">No members yet</p>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-testid="nav-settings">
              <a href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

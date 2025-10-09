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
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';

const menuItems = [
  { title: 'Dashboard', icon: Home, path: '/' },
  { title: 'Calendar', icon: Calendar, path: '/calendar' },
  { title: 'Lists', icon: ShoppingCart, path: '/lists' },
  { title: 'Chores', icon: CheckSquare, path: '/chores' },
  { title: 'School Hub', icon: Mail, path: '/school' },
];

type FamilyMember = {
  id: string;
  name: string;
  color: string | null;
};

type Family = {
  name: string;
};

export default function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const { data: family } = useQuery<Family>({
    queryKey: ['/api/families/current'],
  });

  const { data: members = [] } = useQuery<FamilyMember[]>({
    queryKey: ['/api/family-members'],
    enabled: !!user?.familyId,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">{family?.name || 'Family'}</h2>
            <p className="text-xs text-muted-foreground">{members.length} members</p>
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

        {members.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Family Members</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 px-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2 p-2 rounded-md hover-elevate">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback 
                        style={{ backgroundColor: member.color || 'hsl(210, 70%, 55%)' }} 
                        className="text-white text-xs"
                      >
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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

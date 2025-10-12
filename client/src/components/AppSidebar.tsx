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

const menuItems = [
  { title: 'Dashboard', icon: Home, path: '/' },
  { title: 'Calendar', icon: Calendar, path: '/calendar' },
  { title: 'Lists', icon: ShoppingCart, path: '/lists' },
  { title: 'Chores', icon: CheckSquare, path: '/chores' },
  { title: 'School Hub', icon: Mail, path: '/school' },
];

export default function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Johnson Family</h2>
            <p className="text-xs text-muted-foreground">4 members</p>
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
              <div className="flex items-center gap-2 p-2 rounded-md hover-elevate">
                <Avatar className="h-6 w-6">
                  <AvatarFallback style={{ backgroundColor: 'hsl(30, 75%, 55%)' }} className="text-white text-xs">SJ</AvatarFallback>
                </Avatar>
                <span className="text-sm">Sarah</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md hover-elevate">
                <Avatar className="h-6 w-6">
                  <AvatarFallback style={{ backgroundColor: 'hsl(150, 60%, 50%)' }} className="text-white text-xs">MJ</AvatarFallback>
                </Avatar>
                <span className="text-sm">Mike</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md hover-elevate">
                <Avatar className="h-6 w-6">
                  <AvatarFallback style={{ backgroundColor: 'hsl(270, 65%, 60%)' }} className="text-white text-xs">EM</AvatarFallback>
                </Avatar>
                <span className="text-sm">Emma</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md hover-elevate">
                <Avatar className="h-6 w-6">
                  <AvatarFallback style={{ backgroundColor: 'hsl(340, 70%, 58%)' }} className="text-white text-xs">LJ</AvatarFallback>
                </Avatar>
                <span className="text-sm">Lucas</span>
              </div>
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

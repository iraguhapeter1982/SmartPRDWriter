import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { FamilyProvider } from "./lib/family-context";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import Dashboard from "@/pages/Dashboard";
import CalendarPage from "@/pages/CalendarPage";
import ListsPage from "@/pages/ListsPage";
import ChoresPage from "@/pages/ChoresPage";
import SchoolHubPage from "@/pages/SchoolHubPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import OnboardingPage from "@/pages/OnboardingPage";
import OnboardingContinuePage from "@/pages/OnboardingContinuePage";
import AcceptInvitePage from "@/pages/AcceptInvitePage";
import AuthCallback from "@/pages/AuthCallback";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/not-found";

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/onboarding/continue" component={OnboardingContinuePage} />
      <Route path="/accept-invite/:token" component={AcceptInvitePage} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/lists" component={ListsPage} />
      <Route path="/chores" component={ChoresPage} />
      <Route path="/school" component={SchoolHubPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth pages that should always be accessible
  const authPaths = ["/login", "/signup", "/onboarding", "/accept-invite", "/auth/callback"];
  const isAuthPage = authPaths.some(path => location.startsWith(path));
  
  // Show public router for unauthenticated users OR if on auth pages
  if (!user || isAuthPage) {
    return <PublicRouter />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <LogoutButton />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <AuthenticatedRouter />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FamilyProvider>
          <TooltipProvider>
            <AppLayout />
            <Toaster />
          </TooltipProvider>
        </FamilyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

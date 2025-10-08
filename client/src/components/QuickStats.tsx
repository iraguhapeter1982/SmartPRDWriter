import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Mail, ShoppingCart } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  testId: string;
  color: string;
}

function StatCard({ icon, label, count, testId, color }: StatCardProps) {
  return (
    <Card className="hover-elevate border-0 shadow-sm transition-all duration-200" data-testid={testId}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className={`rounded-full p-2.5 ${color}`}>{icon}</div>
            <p className="text-3xl font-bold tracking-tight" data-testid={`${testId}-count`}>{count}</p>
          </div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickStatsProps {
  pendingChores?: number;
  unreadMessages?: number;
  listItems?: number;
}

export default function QuickStats({ 
  pendingChores = 0, 
  unreadMessages = 0, 
  listItems = 0 
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard 
        icon={<CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />} 
        label="Pending Chores" 
        count={pendingChores}
        testId="stat-chores"
        color="bg-blue-50 dark:bg-blue-950/30"
      />
      <StatCard 
        icon={<Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />} 
        label="Unread Messages" 
        count={unreadMessages}
        testId="stat-messages"
        color="bg-orange-50 dark:bg-orange-950/30"
      />
      <StatCard 
        icon={<ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />} 
        label="Shopping Items" 
        count={listItems}
        testId="stat-list-items"
        color="bg-emerald-50 dark:bg-emerald-950/30"
      />
    </div>
  );
}

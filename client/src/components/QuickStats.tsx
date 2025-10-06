import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Mail, ShoppingCart } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  testId: string;
}

function StatCard({ icon, label, count, testId }: StatCardProps) {
  return (
    <Card className="hover-elevate" data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold" data-testid={`${testId}-count`}>{count}</p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
          </div>
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
    <div className="grid grid-cols-3 gap-3">
      <StatCard 
        icon={<CheckSquare className="h-5 w-5" />} 
        label="Chores" 
        count={pendingChores}
        testId="stat-chores"
      />
      <StatCard 
        icon={<Mail className="h-5 w-5" />} 
        label="Messages" 
        count={unreadMessages}
        testId="stat-messages"
      />
      <StatCard 
        icon={<ShoppingCart className="h-5 w-5" />} 
        label="List Items" 
        count={listItems}
        testId="stat-list-items"
      />
    </div>
  );
}

import DashboardHero from '@/components/DashboardHero';
import TodayCard from '@/components/TodayCard';
import QuickStats from '@/components/QuickStats';
import WeekTimeline from '@/components/WeekTimeline';
import GroceryList from '@/components/GroceryList';
import ChoresList from '@/components/ChoresList';
import SchoolMessages from '@/components/SchoolMessages';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { format, isToday, startOfToday, endOfToday } from 'date-fns';

type Event = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date | null;
  location: string | null;
  assignedMemberId: string | null;
};

type ListItem = {
  id: string;
  title: string;
  purchased: boolean;
  assignedMemberId: string | null;
};

type Chore = {
  id: string;
  title: string;
  assignedMemberId: string | null;
  points: number;
  recurring: string | null;
};

type Message = {
  id: string;
  subject: string;
  sender: string | null;
  preview: string | null;
  receivedAt: Date;
  isUrgent: boolean;
  isRead: boolean;
};

type FamilyMember = {
  id: string;
  name: string;
  color: string | null;
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    enabled: !!user?.familyId,
  });

  const { data: lists = [] } = useQuery<any[]>({
    queryKey: ['/api/lists'],
    enabled: !!user?.familyId,
  });

  // Get items from all lists using useQueries
  const listItemQueries = useQueries({
    queries: lists.map(list => ({
      queryKey: ['/api/lists', list.id, 'items'],
      enabled: !!list.id,
    })),
  });

  const allListItems = listItemQueries.flatMap(q => (q.data as ListItem[] | undefined) || []);

  const { data: chores = [] } = useQuery<Chore[]>({
    queryKey: ['/api/chores'],
    enabled: !!user?.familyId,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!user?.familyId,
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

  const getMemberById = (id: string | null) => {
    if (!id) return null;
    return members.find(m => m.id === id);
  };

  // Filter today's events
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const todayEvents = events
    .filter(e => {
      const eventDate = new Date(e.startTime);
      return eventDate >= todayStart && eventDate <= todayEnd;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5)
    .map(event => {
      const member = getMemberById(event.assignedMemberId);
      return {
        id: event.id,
        title: event.title,
        time: format(new Date(event.startTime), 'h:mm a'),
        location: event.location || undefined,
        memberColor: member?.color || 'hsl(210, 70%, 55%)',
        memberInitials: member ? getInitials(member.name) : '?',
      };
    });

  // Prepare list items for component
  const listItemsForComponent = allListItems
    .filter(item => !item.purchased)
    .slice(0, 5)
    .map(item => {
      const member = getMemberById(item.assignedMemberId);
      return {
        id: item.id,
        title: item.title,
        purchased: item.purchased,
        assignedTo: member ? {
          initials: getInitials(member.name),
          color: member.color || 'hsl(210, 70%, 55%)',
        } : undefined,
      };
    });

  // Prepare chores for component - only include chores with assigned members
  const choresForComponent = chores
    .filter(chore => chore.assignedMemberId)
    .slice(0, 5)
    .map(chore => {
      const member = getMemberById(chore.assignedMemberId);
      return {
        id: chore.id,
        title: chore.title,
        assignee: {
          name: member?.name || 'Unknown',
          initials: member ? getInitials(member.name) : '?',
          color: member?.color || 'hsl(210, 70%, 55%)',
        },
        points: chore.points,
        recurring: chore.recurring as 'daily' | 'weekly' | undefined,
        completed: false,
      };
    });

  // Prepare messages for component
  const messagesForComponent = messages
    .filter(m => !m.isRead)
    .slice(0, 3)
    .map(message => ({
      id: message.id,
      subject: message.subject,
      sender: message.sender || 'Unknown',
      preview: message.preview || '',
      date: format(new Date(message.receivedAt), 'MMM d'),
      isUrgent: message.isUrgent,
    }));

  const stats = {
    pendingChores: chores.length,
    unreadMessages: messages.filter(m => !m.isRead).length,
    listItems: allListItems.filter(i => !i.purchased).length,
  };

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      <DashboardHero />
      
      <QuickStats 
        pendingChores={stats.pendingChores} 
        unreadMessages={stats.unreadMessages} 
        listItems={stats.listItems} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayCard events={todayEvents} />
        <WeekTimeline />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GroceryList items={listItemsForComponent} />
        <ChoresList chores={choresForComponent} />
        <SchoolMessages messages={messagesForComponent} />
      </div>
    </div>
  );
}

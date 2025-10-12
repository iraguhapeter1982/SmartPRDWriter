import DashboardHero from '@/components/DashboardHero';
import TodayCard from '@/components/TodayCard';
import QuickStats from '@/components/QuickStats';
import WeekTimeline from '@/components/WeekTimeline';
import GroceryList from '@/components/GroceryList';
import ChoresList from '@/components/ChoresList';
import SchoolMessages from '@/components/SchoolMessages';

export default function Dashboard() {
  //todo: remove mock functionality
  const mockEvents = [
    {
      id: '1',
      title: 'Drop off Emma at School',
      time: '8:00 AM',
      location: 'Lincoln Elementary',
      memberColor: 'hsl(270, 65%, 60%)',
      memberInitials: 'EM'
    },
    {
      id: '2',
      title: 'Team Meeting',
      time: '10:30 AM',
      memberColor: 'hsl(30, 75%, 55%)',
      memberInitials: 'SJ'
    },
    {
      id: '3',
      title: 'Soccer Practice',
      time: '4:00 PM',
      location: 'City Sports Complex',
      memberColor: 'hsl(150, 60%, 50%)',
      memberInitials: 'LJ'
    }
  ];

  const mockListItems = [
    { id: '1', title: 'Milk', purchased: false, assignedTo: { initials: 'SJ', color: 'hsl(30, 75%, 55%)' } },
    { id: '2', title: 'Bread', purchased: true },
    { id: '3', title: 'Eggs', purchased: false },
    { id: '4', title: 'Apples', purchased: false, assignedTo: { initials: 'MJ', color: 'hsl(150, 60%, 50%)' } }
  ];

  const mockChores = [
    {
      id: '1',
      title: 'Clean bedroom',
      assignee: { name: 'Emma', initials: 'EM', color: 'hsl(270, 65%, 60%)' },
      points: 10,
      recurring: 'daily' as const,
      completed: false
    },
    {
      id: '2',
      title: 'Take out trash',
      assignee: { name: 'Lucas', initials: 'LJ', color: 'hsl(150, 60%, 50%)' },
      points: 5,
      recurring: 'weekly' as const,
      completed: false
    }
  ];

  const mockMessages = [
    {
      id: '1',
      subject: 'Picture Day Tomorrow!',
      sender: 'Mrs. Thompson',
      preview: 'Don\'t forget that school pictures are scheduled for tomorrow.',
      date: '2 hours ago',
      isUrgent: true
    },
    {
      id: '2',
      subject: 'Field Trip Permission Slip',
      sender: 'Principal Davis',
      preview: 'We need permission slips for next week\'s field trip to the science museum.',
      date: '1 day ago'
    }
  ];

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      <DashboardHero />
      
      <QuickStats pendingChores={5} unreadMessages={3} listItems={12} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayCard events={mockEvents} />
        <WeekTimeline />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GroceryList items={mockListItems} />
        <ChoresList chores={mockChores} />
        <SchoolMessages messages={mockMessages} />
      </div>
    </div>
  );
}

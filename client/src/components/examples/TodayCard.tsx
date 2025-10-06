import TodayCard from '../TodayCard';

export default function TodayCardExample() {
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

  return <TodayCard events={mockEvents} />;
}

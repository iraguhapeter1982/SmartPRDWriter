import ChoresList from '../ChoresList';

export default function ChoresListExample() {
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
    },
    {
      id: '3',
      title: 'Feed the dog',
      assignee: { name: 'Emma', initials: 'EM', color: 'hsl(270, 65%, 60%)' },
      points: 5,
      recurring: 'daily' as const,
      completed: true
    }
  ];

  return <ChoresList chores={mockChores} />;
}

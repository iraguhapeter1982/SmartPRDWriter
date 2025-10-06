import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Star, CheckSquare, Trophy } from 'lucide-react';
import { useState } from 'react';

interface Chore {
  id: string;
  title: string;
  description?: string;
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  points: number;
  recurring?: 'daily' | 'weekly';
  completed: boolean;
}

export default function ChoresPage() {
  //todo: remove mock functionality
  const [chores, setChores] = useState<Chore[]>([
    {
      id: '1',
      title: 'Clean bedroom',
      description: 'Make bed, organize desk, vacuum floor',
      assignee: { name: 'Emma', initials: 'EM', color: 'hsl(270, 65%, 60%)' },
      points: 10,
      recurring: 'daily',
      completed: false
    },
    {
      id: '2',
      title: 'Take out trash',
      assignee: { name: 'Lucas', initials: 'LJ', color: 'hsl(150, 60%, 50%)' },
      points: 5,
      recurring: 'weekly',
      completed: false
    },
    {
      id: '3',
      title: 'Feed the dog',
      assignee: { name: 'Emma', initials: 'EM', color: 'hsl(270, 65%, 60%)' },
      points: 5,
      recurring: 'daily',
      completed: true
    },
    {
      id: '4',
      title: 'Do homework',
      assignee: { name: 'Lucas', initials: 'LJ', color: 'hsl(150, 60%, 50%)' },
      points: 15,
      completed: false
    }
  ]);

  const handleComplete = (id: string) => {
    setChores(prev => prev.map(chore => 
      chore.id === id ? { ...chore, completed: !chore.completed } : chore
    ));
    console.log('Chore completed:', id);
  };

  const activeChores = chores.filter(c => !c.completed);
  const completedChores = chores.filter(c => c.completed);
  
  //todo: remove mock functionality
  const leaderboard = [
    { name: 'Emma', initials: 'EM', color: 'hsl(270, 65%, 60%)', points: 125 },
    { name: 'Lucas', initials: 'LJ', color: 'hsl(150, 60%, 50%)', points: 98 }
  ];

  return (
    <div className="space-y-6" data-testid="page-chores">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chores</h1>
        <Button data-testid="button-add-chore">
          <Plus className="h-4 w-4 mr-2" />
          Add Chore
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Active Chores ({activeChores.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeChores.map((chore) => (
              <div 
                key={chore.id} 
                className="flex items-start gap-4 p-4 rounded-md border hover-elevate"
                data-testid={`chore-item-${chore.id}`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback style={{ backgroundColor: chore.assignee.color }} className="text-white">
                    {chore.assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" data-testid={`text-chore-title-${chore.id}`}>{chore.title}</p>
                  {chore.description && (
                    <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {chore.recurring && (
                      <Badge variant="outline">{chore.recurring}</Badge>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-current text-chart-4" />
                      <span className="font-medium">{chore.points} pts</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleComplete(chore.id)}
                  data-testid={`button-complete-${chore.id}`}
                >
                  Complete
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-chart-4" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.map((member, index) => (
              <div 
                key={member.name} 
                className="flex items-center gap-3 p-3 rounded-md hover-elevate"
                data-testid={`leaderboard-${index + 1}`}
              >
                <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarFallback style={{ backgroundColor: member.color }} className="text-white">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{member.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{member.points} points</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {completedChores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Recently Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedChores.map((chore) => (
              <div 
                key={chore.id} 
                className="flex items-center gap-3 p-3 rounded-md opacity-60"
                data-testid={`completed-chore-${chore.id}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback style={{ backgroundColor: chore.assignee.color }} className="text-white text-xs">
                    {chore.assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 line-through">{chore.title}</span>
                <Badge variant="secondary">Done</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

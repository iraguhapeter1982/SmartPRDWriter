import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckSquare, Star } from 'lucide-react';
import { useState } from 'react';

interface Chore {
  id: string;
  title: string;
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  points: number;
  recurring?: 'daily' | 'weekly';
  completed: boolean;
}

interface ChoresListProps {
  chores?: Chore[];
}

export default function ChoresList({ chores: initialChores = [] }: ChoresListProps) {
  const [chores, setChores] = useState<Chore[]>(initialChores);

  const handleComplete = (id: string) => {
    setChores(prev => prev.map(chore => 
      chore.id === id ? { ...chore, completed: !chore.completed } : chore
    ));
    console.log('Chore completed:', id);
  };

  return (
    <Card data-testid="card-chores-list">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Chores</CardTitle>
        <CheckSquare className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {chores.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No chores assigned</p>
        ) : (
          <div className="space-y-2">
            {chores.map((chore) => (
              <div 
                key={chore.id} 
                className="flex items-center gap-3 p-3 rounded-md hover-elevate"
                data-testid={`chore-item-${chore.id}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback style={{ backgroundColor: chore.assignee.color }} className="text-white text-xs">
                    {chore.assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${chore.completed ? 'line-through text-muted-foreground' : ''}`} data-testid={`text-chore-title-${chore.id}`}>
                    {chore.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {chore.recurring && (
                      <Badge variant="outline" className="text-xs">
                        {chore.recurring}
                      </Badge>
                    )}
                    {chore.points > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-current" />
                        {chore.points}
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={chore.completed ? "secondary" : "default"}
                  onClick={() => handleComplete(chore.id)}
                  data-testid={`button-complete-${chore.id}`}
                >
                  {chore.completed ? 'Done' : 'Complete'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

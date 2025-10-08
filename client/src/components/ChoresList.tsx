import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, Star } from 'lucide-react';
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
  };

  const activeChores = chores.filter(c => !c.completed);
  const completedChores = chores.filter(c => c.completed);

  return (
    <Card data-testid="card-chores-list" className="shadow-sm border-0">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Chores</CardTitle>
        <div className="rounded-full bg-blue-50 dark:bg-blue-950/30 p-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {chores.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No chores assigned</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeChores.length > 0 && (
              <div className="space-y-2">
                {activeChores.map((chore) => (
                  <div 
                    key={chore.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover-elevate transition-all duration-200"
                    data-testid={`chore-item-${chore.id}`}
                  >
                    <Avatar className="h-9 w-9 border-2" style={{ borderColor: chore.assignee.color }}>
                      <AvatarFallback style={{ backgroundColor: chore.assignee.color }} className="text-white text-xs font-medium">
                        {chore.assignee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight" data-testid={`text-chore-title-${chore.id}`}>
                        {chore.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {chore.recurring && (
                          <Badge variant="outline" className="text-xs font-medium">
                            {chore.recurring}
                          </Badge>
                        )}
                        {chore.points > 0 && (
                          <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <Star className="h-3 w-3 fill-current" />
                            {chore.points}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleComplete(chore.id)}
                      data-testid={`button-complete-${chore.id}`}
                    >
                      Complete
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {completedChores.length > 0 && (
              <div className="pt-2 border-t space-y-2">
                {completedChores.map((chore) => (
                  <div 
                    key={chore.id} 
                    className="flex items-center gap-3 p-3 rounded-lg hover-elevate opacity-60 transition-all duration-200"
                    data-testid={`chore-item-${chore.id}`}
                  >
                    <Avatar className="h-9 w-9 border-2" style={{ borderColor: chore.assignee.color }}>
                      <AvatarFallback style={{ backgroundColor: chore.assignee.color }} className="text-white text-xs font-medium">
                        {chore.assignee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-through text-muted-foreground" data-testid={`text-chore-title-${chore.id}`}>
                        {chore.title}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleComplete(chore.id)}
                      data-testid={`button-complete-${chore.id}`}
                    >
                      Done
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

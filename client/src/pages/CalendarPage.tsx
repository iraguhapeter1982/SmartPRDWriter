import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, RefreshCw, Plus } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authenticatedFetch } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { CalendarEvent } from '@shared/schema';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Fetch user's families
  const { data: familiesData } = useQuery<Array<{ family: { id: string; name: string }; role: string }>>({
    queryKey: ['/api/families'],
  });

  const familyId = familiesData?.[0]?.family?.id;

  // Fetch calendar events
  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/families', familyId, 'calendar/events'],
    enabled: !!familyId,
  });

  // Sync calendar mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!familyId) throw new Error('No family selected');
      const response = await authenticatedFetch(`/api/families/${familyId}/calendar/sync`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to sync calendar');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/families', familyId, 'calendar/events'] });
      toast({
        title: 'Calendar synced',
        description: 'Google Calendar events have been synced successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Group events by day
  const eventsOnDay: Record<number, CalendarEvent[]> = {};
  events.forEach(event => {
    const eventDate = new Date(event.startTime);
    if (eventDate.getMonth() === currentMonth.getMonth() && 
        eventDate.getFullYear() === currentMonth.getFullYear()) {
      const day = eventDate.getDate();
      if (!eventsOnDay[day]) eventsOnDay[day] = [];
      eventsOnDay[day].push(event);
    }
  });

  // Get upcoming events (next 7 days)
  const today = new Date();
  const upcomingEvents = events
    .filter(event => new Date(event.startTime) >= today)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="space-y-6" data-testid="page-calendar">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || !familyId}
            data-testid="button-sync-calendar"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Google Calendar
          </Button>
          <Button data-testid="button-add-event">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-2xl">{monthName}</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              data-testid="button-previous-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              data-testid="button-next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                {day}
              </div>
            ))}
            
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = eventsOnDay[day] || [];
              const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isTodayDay = isToday(dayDate);
              
              return (
                <div 
                  key={day} 
                  className={`aspect-square p-2 rounded-md border hover-elevate cursor-pointer ${isTodayDay ? 'bg-primary text-primary-foreground border-primary' : ''}`}
                  data-testid={`calendar-day-${day}`}
                >
                  <div className="text-sm font-medium mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div 
                        key={event.id} 
                        className={`text-xs p-1 rounded flex items-center gap-1 ${isTodayDay ? 'bg-primary-foreground/20' : 'bg-card'}`}
                      >
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: event.memberColor || 'hsl(200, 70%, 50%)' }} 
                        />
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-md hover-elevate">
            <Avatar className="h-10 w-10">
              <AvatarFallback style={{ backgroundColor: 'hsl(30, 75%, 55%)' }} className="text-white">SJ</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">Team Meeting</p>
              <p className="text-sm text-muted-foreground">Today at 10:30 AM</p>
            </div>
            <Badge>Today</Badge>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-md hover-elevate">
            <Avatar className="h-10 w-10">
              <AvatarFallback style={{ backgroundColor: 'hsl(270, 65%, 60%)' }} className="text-white">EM</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">School Field Trip</p>
              <p className="text-sm text-muted-foreground">Dec 12 at 9:00 AM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

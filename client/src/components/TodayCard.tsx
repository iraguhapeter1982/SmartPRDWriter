import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Event {
  id: string;
  title: string;
  time: string;
  location?: string;
  memberColor: string;
  memberInitials: string;
}

interface TodayCardProps {
  events?: Event[];
}

export default function TodayCard({ events = [] }: TodayCardProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  return (
    <Card data-testid="card-today">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Today</CardTitle>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground" data-testid="text-today-date">{today}</p>
        
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No events scheduled for today</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="flex items-start gap-3 p-3 rounded-md hover-elevate"
                data-testid={`event-item-${event.id}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback style={{ backgroundColor: event.memberColor }} className="text-white text-xs">
                      {event.memberInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" data-testid={`text-event-title-${event.id}`}>{event.title}</p>
                  <p className="text-xs text-muted-foreground font-mono" data-testid={`text-event-time-${event.id}`}>{event.time}</p>
                  {event.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{event.location}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

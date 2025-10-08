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
    <Card data-testid="card-today" className="shadow-sm border-0">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <div>
          <CardTitle className="text-2xl font-bold">Today</CardTitle>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-today-date">{today}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No events scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover-elevate transition-all duration-200"
                data-testid={`event-item-${event.id}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Avatar className="h-9 w-9 border-2" style={{ borderColor: event.memberColor }}>
                    <AvatarFallback style={{ backgroundColor: event.memberColor }} className="text-white text-xs font-medium">
                      {event.memberInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight" data-testid={`text-event-title-${event.id}`}>{event.title}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1" data-testid={`text-event-time-${event.id}`}>{event.time}</p>
                  {event.location && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground truncate">{event.location}</p>
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

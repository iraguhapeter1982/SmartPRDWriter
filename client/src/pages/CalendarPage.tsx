import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useState } from 'react';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  //todo: remove mock functionality
  const eventsOnDay: Record<number, Array<{ title: string; color: string; initials: string }>> = {
    6: [
      { title: 'Team Meeting', color: 'hsl(30, 75%, 55%)', initials: 'SJ' },
      { title: 'Soccer', color: 'hsl(150, 60%, 50%)', initials: 'LJ' }
    ],
    12: [{ title: 'School Trip', color: 'hsl(270, 65%, 60%)', initials: 'EM' }],
    18: [{ title: 'Piano Lesson', color: 'hsl(340, 70%, 58%)', initials: 'LJ' }],
  };

  return (
    <div className="space-y-6" data-testid="page-calendar">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Button data-testid="button-add-event">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
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
              const events = eventsOnDay[day] || [];
              const isToday = day === 6;
              
              return (
                <div 
                  key={day} 
                  className={`aspect-square p-2 rounded-md border hover-elevate cursor-pointer ${isToday ? 'bg-primary text-primary-foreground border-primary' : ''}`}
                  data-testid={`calendar-day-${day}`}
                >
                  <div className="text-sm font-medium mb-1">{day}</div>
                  <div className="space-y-1">
                    {events.slice(0, 2).map((event, idx) => (
                      <div 
                        key={idx} 
                        className={`text-xs p-1 rounded flex items-center gap-1 ${isToday ? 'bg-primary-foreground/20' : 'bg-card'}`}
                      >
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{events.length - 2} more</div>
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DayEvent {
  id: string;
  color: string;
}

interface WeekDay {
  date: number;
  dayName: string;
  isToday: boolean;
  events: DayEvent[];
}

export default function WeekTimeline() {
  const [currentWeek, setCurrentWeek] = useState(0);
  
  // Mock week data
  const weekDays: WeekDay[] = [
    { date: 4, dayName: 'Mon', isToday: false, events: [{ id: '1', color: 'hsl(270, 65%, 60%)' }] },
    { date: 5, dayName: 'Tue', isToday: false, events: [{ id: '2', color: 'hsl(30, 75%, 55%)' }, { id: '3', color: 'hsl(150, 60%, 50%)' }] },
    { date: 6, dayName: 'Wed', isToday: true, events: [{ id: '4', color: 'hsl(270, 65%, 60%)' }, { id: '5', color: 'hsl(340, 70%, 58%)' }] },
    { date: 7, dayName: 'Thu', isToday: false, events: [] },
    { date: 8, dayName: 'Fri', isToday: false, events: [{ id: '6', color: 'hsl(30, 75%, 55%)' }] },
    { date: 9, dayName: 'Sat', isToday: false, events: [{ id: '7', color: 'hsl(150, 60%, 50%)' }, { id: '8', color: 'hsl(270, 65%, 60%)' }, { id: '9', color: 'hsl(340, 70%, 58%)' }] },
    { date: 10, dayName: 'Sun', isToday: false, events: [] }
  ];

  return (
    <Card data-testid="card-week-timeline">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">This Week</CardTitle>
        <div className="flex gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7"
            onClick={() => setCurrentWeek(prev => prev - 1)}
            data-testid="button-previous-week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7"
            onClick={() => setCurrentWeek(prev => prev + 1)}
            data-testid="button-next-week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className={`text-center p-2 rounded-md ${day.isToday ? 'bg-primary text-primary-foreground' : 'hover-elevate'}`}
              data-testid={`day-${day.dayName.toLowerCase()}`}
            >
              <p className={`text-xs font-medium ${day.isToday ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {day.dayName}
              </p>
              <p className={`text-lg font-semibold mt-1 ${day.isToday ? 'text-primary-foreground' : ''}`}>
                {day.date}
              </p>
              <div className="flex justify-center gap-1 mt-2 min-h-[8px]">
                {day.events.slice(0, 3).map((event) => (
                  <div 
                    key={event.id} 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: event.color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  subject: string;
  sender: string;
  preview: string;
  date: string;
  isUrgent?: boolean;
  category?: 'teacher' | 'class' | 'school';
}

interface SchoolMessagesProps {
  messages?: Message[];
}

export default function SchoolMessages({ messages = [] }: SchoolMessagesProps) {
  return (
    <Card data-testid="card-school-messages" className="shadow-sm border-0">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">School Hub</CardTitle>
        <div className="rounded-full bg-orange-50 dark:bg-orange-950/30 p-2">
          <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <Mail className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No new messages</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className="p-3 rounded-lg bg-muted/30 hover-elevate cursor-pointer transition-all duration-200"
                onClick={() => console.log('Message clicked:', message.id)}
                data-testid={`message-item-${message.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {message.isUrgent && (
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    )}
                    <p className="font-semibold text-sm truncate leading-tight" data-testid={`text-message-subject-${message.id}`}>
                      {message.subject}
                    </p>
                  </div>
                  {message.isUrgent && (
                    <Badge variant="destructive" className="text-xs flex-shrink-0 font-medium">Urgent</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium mb-1.5">
                  {message.sender} • {message.date}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {message.preview}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
    <Card data-testid="card-school-messages">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">School Hub</CardTitle>
        <Mail className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No new messages</p>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className="p-3 rounded-md hover-elevate cursor-pointer"
                onClick={() => console.log('Message clicked:', message.id)}
                data-testid={`message-item-${message.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {message.isUrgent && (
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    )}
                    <p className="font-semibold text-sm truncate" data-testid={`text-message-subject-${message.id}`}>
                      {message.subject}
                    </p>
                  </div>
                  {message.isUrgent && (
                    <Badge variant="destructive" className="text-xs flex-shrink-0">Urgent</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{message.sender} • {message.date}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{message.preview}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

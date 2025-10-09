import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Mail, Filter, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type Message = {
  id: string;
  familyId: string;
  subject: string;
  sender: string | null;
  senderEmail: string | null;
  body: string | null;
  preview: string | null;
  isUrgent: boolean;
  isRead: boolean;
  receivedAt: Date;
};

export default function SchoolHubPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!user?.familyId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('PATCH', `/api/messages/${id}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const unreadCount = messages.filter(m => !m.isRead).length;
  const urgentMessages = messages.filter(m => m.isUrgent);

  const webhookUrl = user?.familyId 
    ? `${window.location.origin}/api/webhooks/messages/${user.familyId}`
    : '';

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
    toast({
      title: 'Copied!',
      description: 'Webhook URL copied to clipboard',
    });
  };

  return (
    <div className="space-y-6" data-testid="page-school-hub">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Hub</h1>
          <p className="text-muted-foreground mt-1">{unreadCount} unread messages</p>
        </div>
      </div>

      {messages.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              School Message Webhook
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure your school's email system to forward messages to this webhook URL:
            </p>
            <div className="flex gap-2">
              <code className="flex-1 bg-muted p-3 rounded-md text-sm break-all">
                {webhookUrl}
              </code>
              <Button 
                variant="outline" 
                size="icon"
                onClick={copyWebhookUrl}
                data-testid="button-copy-webhook"
              >
                {copiedWebhook ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The webhook expects a JSON payload with: subject, sender, senderEmail, body, preview, and isUrgent fields.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="urgent" data-testid="tab-urgent">
            Urgent {urgentMessages.length > 0 && `(${urgentMessages.length})`}
          </TabsTrigger>
          <TabsTrigger value="unread" data-testid="tab-unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-0">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 hover-elevate cursor-pointer ${!message.isRead ? 'bg-card' : ''}`}
                        onClick={() => handleMessageClick(message)}
                        data-testid={`message-item-${message.id}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {message.isUrgent && (
                              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                            )}
                            {!message.isRead && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                            <p className={`font-semibold text-sm truncate ${!message.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {message.subject}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(message.receivedAt), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{message.sender}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{message.preview}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hidden lg:block">
              <CardContent className="p-6">
                {selectedMessage ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold" data-testid="text-selected-subject">
                        {selectedMessage.subject}
                      </h3>
                      {selectedMessage.isUrgent && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{selectedMessage.sender}</p>
                      {selectedMessage.senderEmail && (
                        <p className="text-sm text-muted-foreground">{selectedMessage.senderEmail}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(selectedMessage.receivedAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="whitespace-pre-wrap text-sm" data-testid="text-selected-body">
                        {selectedMessage.body || selectedMessage.preview}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Select a message to read</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="urgent" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-0">
                {urgentMessages.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No urgent messages</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {urgentMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 hover-elevate cursor-pointer ${!message.isRead ? 'bg-card' : ''}`}
                        onClick={() => handleMessageClick(message)}
                        data-testid={`message-item-${message.id}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                            {!message.isRead && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                            <p className={`font-semibold text-sm truncate ${!message.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {message.subject}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(message.receivedAt), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{message.sender}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{message.preview}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hidden lg:block">
              <CardContent className="p-6">
                {selectedMessage ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                      {selectedMessage.isUrgent && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{selectedMessage.sender}</p>
                      {selectedMessage.senderEmail && (
                        <p className="text-sm text-muted-foreground">{selectedMessage.senderEmail}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(selectedMessage.receivedAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="whitespace-pre-wrap text-sm">{selectedMessage.body || selectedMessage.preview}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Select a message to read</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-0">
                {messages.filter(m => !m.isRead).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Check className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>All caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {messages.filter(m => !m.isRead).map((message) => (
                      <div
                        key={message.id}
                        className="p-4 hover-elevate cursor-pointer bg-card"
                        onClick={() => handleMessageClick(message)}
                        data-testid={`message-item-${message.id}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {message.isUrgent && (
                              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                            )}
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            <p className="font-semibold text-sm truncate">{message.subject}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(message.receivedAt), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{message.sender}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{message.preview}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hidden lg:block">
              <CardContent className="p-6">
                {selectedMessage ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                      {selectedMessage.isUrgent && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{selectedMessage.sender}</p>
                      {selectedMessage.senderEmail && (
                        <p className="text-sm text-muted-foreground">{selectedMessage.senderEmail}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(selectedMessage.receivedAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="whitespace-pre-wrap text-sm">{selectedMessage.body || selectedMessage.preview}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Select a message to read</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

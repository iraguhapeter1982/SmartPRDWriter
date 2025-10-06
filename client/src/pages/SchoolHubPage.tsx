import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Mail, Filter } from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  subject: string;
  sender: string;
  preview: string;
  body: string;
  date: string;
  isUrgent: boolean;
  category: 'teacher' | 'class' | 'school';
  read: boolean;
}

export default function SchoolHubPage() {
  //todo: remove mock functionality
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      subject: 'Picture Day Tomorrow!',
      sender: 'Mrs. Thompson - 3rd Grade Teacher',
      preview: 'Don\'t forget that school pictures are scheduled for tomorrow.',
      body: 'Dear Parents,\n\nThis is a friendly reminder that school pictures are scheduled for tomorrow, December 7th. Please have your child wear their best smile and appropriate attire. Picture packages and pricing information were sent home last week.\n\nBest regards,\nMrs. Thompson',
      date: '2 hours ago',
      isUrgent: true,
      category: 'teacher',
      read: false
    },
    {
      id: '2',
      subject: 'Field Trip Permission Slip Due Friday',
      sender: 'Principal Davis',
      preview: 'We need permission slips for next week\'s field trip to the science museum.',
      body: 'Dear Families,\n\nWe are excited about our upcoming field trip to the Science Museum on December 15th. Please return the signed permission slip by this Friday, December 8th. Students will need to bring a sack lunch.\n\nSincerely,\nPrincipal Davis',
      date: '1 day ago',
      isUrgent: false,
      category: 'school',
      read: false
    },
    {
      id: '3',
      subject: 'Great Job on Math Test!',
      sender: 'Mr. Johnson - Math Teacher',
      preview: 'Your child did excellent on last week\'s math test.',
      body: 'Hello,\n\nI wanted to let you know that your child scored 95% on last week\'s math test! Their hard work is really paying off. Keep up the great work!\n\nBest,\nMr. Johnson',
      date: '2 days ago',
      isUrgent: false,
      category: 'teacher',
      read: true
    },
    {
      id: '4',
      subject: 'Winter Concert Next Week',
      sender: 'Ms. Rodriguez - Music Teacher',
      preview: 'Join us for our annual winter concert on December 14th.',
      body: 'Dear Parents and Guardians,\n\nYou are cordially invited to our annual Winter Concert on Thursday, December 14th at 6:30 PM in the school auditorium. Students should arrive by 6:00 PM for warm-up. We look forward to seeing you there!\n\nMusically yours,\nMs. Rodriguez',
      date: '3 days ago',
      isUrgent: false,
      category: 'class',
      read: true
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setMessages(prev => prev.map(m => 
      m.id === message.id ? { ...m, read: true } : m
    ));
    console.log('Message opened:', message.id);
  };

  const unreadCount = messages.filter(m => !m.read).length;
  const urgentMessages = messages.filter(m => m.isUrgent);

  return (
    <div className="space-y-6" data-testid="page-school-hub">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Hub</h1>
          <p className="text-muted-foreground mt-1">{unreadCount} unread messages</p>
        </div>
        <Button variant="outline" data-testid="button-filters">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="urgent" data-testid="tab-urgent">
            Urgent {urgentMessages.length > 0 && `(${urgentMessages.length})`}
          </TabsTrigger>
          <TabsTrigger value="teacher" data-testid="tab-teacher">Teacher</TabsTrigger>
          <TabsTrigger value="class" data-testid="tab-class">Class</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 hover-elevate cursor-pointer ${!message.read ? 'bg-card' : ''}`}
                      onClick={() => handleMessageClick(message)}
                      data-testid={`message-item-${message.id}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {message.isUrgent && (
                            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                          )}
                          {!message.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                          <p className={`font-semibold text-sm truncate ${!message.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {message.subject}
                          </p>
                        </div>
                        {message.isUrgent && (
                          <Badge variant="destructive" className="text-xs flex-shrink-0">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{message.sender}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{message.preview}</p>
                      <p className="text-xs text-muted-foreground mt-2">{message.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                {selectedMessage ? (
                  <div data-testid="message-detail">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">{selectedMessage.subject}</h3>
                      </div>
                      {selectedMessage.isUrgent && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{selectedMessage.sender}</p>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line">{selectedMessage.body}</p>
                    </div>
                    <div className="flex gap-2 mt-6 pt-4 border-t">
                      <Button variant="outline" size="sm">Reply</Button>
                      <Button variant="outline" size="sm">Archive</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Select a message to read</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="urgent" className="mt-6">
          <Card>
            <CardContent className="p-4">
              {urgentMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No urgent messages</p>
              ) : (
                <div className="divide-y">
                  {urgentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 hover-elevate cursor-pointer"
                      onClick={() => handleMessageClick(message)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <p className="font-semibold text-sm">{message.subject}</p>
                        <Badge variant="destructive" className="text-xs ml-auto">Urgent</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.preview}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher" className="mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="divide-y">
                {messages.filter(m => m.category === 'teacher').map((message) => (
                  <div
                    key={message.id}
                    className="p-4 hover-elevate cursor-pointer"
                    onClick={() => handleMessageClick(message)}
                  >
                    <p className="font-semibold text-sm mb-1">{message.subject}</p>
                    <p className="text-xs text-muted-foreground">{message.sender}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="class" className="mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="divide-y">
                {messages.filter(m => m.category === 'class').map((message) => (
                  <div
                    key={message.id}
                    className="p-4 hover-elevate cursor-pointer"
                    onClick={() => handleMessageClick(message)}
                  >
                    <p className="font-semibold text-sm mb-1">{message.subject}</p>
                    <p className="text-xs text-muted-foreground">{message.sender}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

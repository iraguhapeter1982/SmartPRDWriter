import SchoolMessages from '../SchoolMessages';

export default function SchoolMessagesExample() {
  const mockMessages = [
    {
      id: '1',
      subject: 'Picture Day Tomorrow!',
      sender: 'Mrs. Thompson',
      preview: 'Don\'t forget that school pictures are scheduled for tomorrow. Please have your child wear their best smile!',
      date: '2 hours ago',
      isUrgent: true,
      category: 'teacher' as const
    },
    {
      id: '2',
      subject: 'Field Trip Permission Slip',
      sender: 'Principal Davis',
      preview: 'We need permission slips for next week\'s field trip to the science museum. Please return by Friday.',
      date: '1 day ago',
      category: 'school' as const
    },
    {
      id: '3',
      subject: 'Math Test Results',
      sender: 'Mr. Johnson',
      preview: 'Your child did great on last week\'s math test! Scores are available in the parent portal.',
      date: '2 days ago',
      category: 'teacher' as const
    }
  ];

  return <SchoolMessages messages={mockMessages} />;
}

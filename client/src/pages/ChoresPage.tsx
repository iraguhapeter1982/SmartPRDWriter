import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Star, CheckSquare, Trophy, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Chore = {
  id: string;
  familyId: string;
  title: string;
  description: string | null;
  assignedMemberId: string | null;
  points: number;
  recurring: string | null;
};

type ChoreCompletion = {
  id: string;
  choreId: string;
  completedByMemberId: string;
  completedAt: Date;
  pointsEarned: number;
};

type FamilyMember = {
  id: string;
  name: string;
  color: string | null;
};

export default function ChoresPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [choreDialog, setChoreDialog] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedMemberId: '',
    points: '10',
    recurring: '',
  });

  const { data: chores = [] } = useQuery<Chore[]>({
    queryKey: ['/api/chores'],
    enabled: !!user?.familyId,
  });

  const { data: members = [] } = useQuery<FamilyMember[]>({
    queryKey: ['/api/family-members'],
    enabled: !!user?.familyId,
  });

  const createChoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/chores', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chores'] });
      setChoreDialog(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Chore created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateChoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/chores/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chores'] });
      setChoreDialog(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Chore updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteChoreMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/chores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chores'] });
      toast({
        title: 'Success',
        description: 'Chore deleted',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const completeChoreMutation = useMutation({
    mutationFn: async ({ choreId, memberId, points }: { choreId: string; memberId: string; points: number }) => {
      const response = await apiRequest('POST', `/api/chores/${choreId}/complete`, {
        completedByMemberId: memberId,
        pointsEarned: points,
        completedAt: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chores'] });
      toast({
        title: 'Success',
        description: 'Chore completed! Points earned.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedMemberId: '',
      points: '10',
      recurring: '',
    });
    setEditingChore(null);
  };

  const handleOpenDialog = (chore?: Chore) => {
    if (chore) {
      setEditingChore(chore);
      setFormData({
        title: chore.title,
        description: chore.description || '',
        assignedMemberId: chore.assignedMemberId || '',
        points: chore.points.toString(),
        recurring: chore.recurring || '',
      });
    } else {
      resetForm();
    }
    setChoreDialog(true);
  };

  const handleSave = () => {
    const data = {
      title: formData.title,
      description: formData.description || null,
      assignedMemberId: formData.assignedMemberId || null,
      points: parseInt(formData.points),
      recurring: formData.recurring || null,
    };

    if (editingChore) {
      updateChoreMutation.mutate({ id: editingChore.id, data });
    } else {
      createChoreMutation.mutate(data);
    }
  };

  const handleComplete = (chore: Chore) => {
    if (!chore.assignedMemberId) {
      toast({
        title: 'No assignee',
        description: 'This chore needs to be assigned to someone first',
        variant: 'destructive',
      });
      return;
    }
    completeChoreMutation.mutate({
      choreId: chore.id,
      memberId: chore.assignedMemberId,
      points: chore.points,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMemberById = (id: string) => {
    return members.find(m => m.id === id);
  };

  return (
    <div className="space-y-6" data-testid="page-chores">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chores</h1>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-chore">
          <Plus className="h-4 w-4 mr-2" />
          Add Chore
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Active Chores ({chores.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {chores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No chores yet. Add one to get started!</p>
              </div>
            ) : (
              chores.map((chore) => {
                const member = chore.assignedMemberId ? getMemberById(chore.assignedMemberId) : null;
                return (
                  <div 
                    key={chore.id} 
                    className="flex items-start gap-4 p-4 rounded-md border hover-elevate group"
                    data-testid={`chore-item-${chore.id}`}
                  >
                    {member ? (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback style={{ backgroundColor: member.color || 'hsl(210, 70%, 55%)' }} className="text-white">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">?</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-medium" data-testid={`text-chore-title-${chore.id}`}>{chore.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {chore.points}
                          </Badge>
                          {chore.recurring && (
                            <Badge variant="outline">{chore.recurring}</Badge>
                          )}
                        </div>
                      </div>
                      {chore.description && (
                        <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleComplete(chore)}
                          disabled={completeChoreMutation.isPending}
                          data-testid={`button-complete-${chore.id}`}
                        >
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleOpenDialog(chore)}
                          data-testid={`button-edit-${chore.id}`}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteChoreMutation.mutate(chore.id)}
                          data-testid={`button-delete-${chore.id}`}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground text-center py-4">
              Leaderboard coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={choreDialog} onOpenChange={(open) => {
        setChoreDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChore ? 'Edit Chore' : 'Add New Chore'}</DialogTitle>
            <DialogDescription>
              {editingChore ? 'Update chore details' : 'Create a new chore for the family'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Clean bedroom"
                data-testid="input-chore-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about the chore"
                data-testid="input-chore-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Assign to</Label>
              <Select value={formData.assignedMemberId} onValueChange={(value) => setFormData({ ...formData, assignedMemberId: value })}>
                <SelectTrigger data-testid="select-assignee">
                  <SelectValue placeholder="Select family member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  data-testid="input-chore-points"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurring">Recurring</Label>
                <Select value={formData.recurring} onValueChange={(value) => setFormData({ ...formData, recurring: value })}>
                  <SelectTrigger data-testid="select-recurring">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setChoreDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={createChoreMutation.isPending || updateChoreMutation.isPending}
              data-testid="button-save-chore"
            >
              {(createChoreMutation.isPending || updateChoreMutation.isPending) ? 'Saving...' : 'Save Chore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

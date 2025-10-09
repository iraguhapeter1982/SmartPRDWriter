import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, ShoppingCart, Trash2, ListChecks } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type List = {
  id: string;
  familyId: string;
  name: string;
  type: string | null;
};

type ListItem = {
  id: string;
  listId: string;
  title: string;
  purchased: boolean;
  assignedMemberId: string | null;
  purchasedAt: Date | null;
};

type FamilyMember = {
  id: string;
  name: string;
  color: string | null;
};

export default function ListsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newItem, setNewItem] = useState('');
  const [createListDialog, setCreateListDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const { data: lists = [] } = useQuery<List[]>({
    queryKey: ['/api/lists'],
    enabled: !!user?.familyId,
  });

  const { data: members = [] } = useQuery<FamilyMember[]>({
    queryKey: ['/api/family-members'],
    enabled: !!user?.familyId,
  });

  const activeList = selectedListId ? lists.find(l => l.id === selectedListId) : lists[0];

  const { data: items = [] } = useQuery<ListItem[]>({
    queryKey: ['/api/lists', activeList?.id, 'items'],
    enabled: !!activeList,
  });

  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest('POST', '/api/lists', { name, type: 'grocery' });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/lists'] });
      setSelectedListId(data.id);
      setCreateListDialog(false);
      setNewListName('');
      toast({
        title: 'Success',
        description: 'List created successfully',
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

  const addItemMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!activeList) return;
      const response = await apiRequest('POST', `/api/lists/${activeList.id}/items`, { title });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lists', activeList?.id, 'items'] });
      setNewItem('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, purchased }: { id: string; purchased: boolean }) => {
      if (!activeList) return;
      await apiRequest('PATCH', `/api/lists/${activeList.id}/items/${id}`, { 
        purchased,
        purchasedAt: purchased ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lists', activeList?.id, 'items'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!activeList) return;
      await apiRequest('DELETE', `/api/lists/${activeList.id}/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lists', activeList?.id, 'items'] });
      toast({
        title: 'Success',
        description: 'Item deleted',
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

  const handleAdd = () => {
    if (newItem.trim()) {
      addItemMutation.mutate(newItem);
    }
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      createListMutation.mutate(newListName);
    }
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

  const activeItems = items.filter(item => !item.purchased);
  const completedItems = items.filter(item => item.purchased);

  if (!activeList && lists.length === 0) {
    return (
      <div className="space-y-6" data-testid="page-lists">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Shopping Lists</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ListChecks className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No lists yet</h3>
            <p className="text-muted-foreground text-center mb-4">Create your first shopping list to get started</p>
            <Button onClick={() => setCreateListDialog(true)} data-testid="button-create-first-list">
              <Plus className="h-4 w-4 mr-2" />
              Create List
            </Button>
          </CardContent>
        </Card>

        <Dialog open={createListDialog} onOpenChange={setCreateListDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New List</DialogTitle>
              <DialogDescription>Give your shopping list a name</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="list-name">List Name</Label>
                <Input
                  id="list-name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Weekly Groceries"
                  data-testid="input-list-name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateListDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateList} disabled={createListMutation.isPending} data-testid="button-save-list">
                {createListMutation.isPending ? 'Creating...' : 'Create List'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-lists">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shopping Lists</h1>
          {activeList && (
            <p className="text-muted-foreground mt-1">{activeList.name}</p>
          )}
        </div>
        <div className="flex gap-2">
          {lists.length > 1 && (
            <Select value={selectedListId || activeList?.id} onValueChange={setSelectedListId}>
              <SelectTrigger className="w-[200px]" data-testid="select-list">
                <SelectValue placeholder="Select list" />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" onClick={() => setCreateListDialog(true)} data-testid="button-new-list">
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Active Items ({activeItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeItems.map((item) => {
            const member = item.assignedMemberId ? getMemberById(item.assignedMemberId) : null;
            return (
              <div 
                key={item.id} 
                className="flex items-start gap-3 p-3 rounded-md hover-elevate group"
                data-testid={`list-item-${item.id}`}
              >
                <Checkbox 
                  checked={item.purchased}
                  onCheckedChange={() => toggleItemMutation.mutate({ id: item.id, purchased: !item.purchased })}
                  data-testid={`checkbox-item-${item.id}`}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium" data-testid={`text-item-title-${item.id}`}>{item.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {member && (
                    <Avatar className="h-7 w-7">
                      <AvatarFallback style={{ backgroundColor: member.color || 'hsl(210, 70%, 55%)' }} className="text-white text-xs">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          <div className="flex gap-2 pt-3 border-t">
            <Input 
              placeholder="Add new item..." 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              disabled={addItemMutation.isPending}
              data-testid="input-new-item"
            />
            <Button onClick={handleAdd} disabled={addItemMutation.isPending} data-testid="button-add-item">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {completedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <ListChecks className="h-5 w-5" />
              Completed ({completedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedItems.map((item) => {
              const member = item.assignedMemberId ? getMemberById(item.assignedMemberId) : null;
              return (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-2 rounded-md opacity-60"
                  data-testid={`list-item-${item.id}`}
                >
                  <Checkbox 
                    checked={item.purchased}
                    onCheckedChange={() => toggleItemMutation.mutate({ id: item.id, purchased: !item.purchased })}
                    data-testid={`checkbox-item-${item.id}`}
                  />
                  <div className="flex-1">
                    <p className="line-through text-sm" data-testid={`text-item-title-${item.id}`}>{item.title}</p>
                  </div>
                  {member && (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback style={{ backgroundColor: member.color || 'hsl(210, 70%, 55%)' }} className="text-white text-xs">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Dialog open={createListDialog} onOpenChange={setCreateListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>Give your shopping list a name</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Weekly Groceries"
                data-testid="input-list-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateListDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList} disabled={createListMutation.isPending} data-testid="button-save-list">
              {createListMutation.isPending ? 'Creating...' : 'Create List'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

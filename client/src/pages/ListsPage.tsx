import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ListItem {
  id: string;
  title: string;
  note?: string;
  aisle?: string;
  purchased: boolean;
  assignedTo?: { initials: string; color: string };
}

export default function ListsPage() {
  //todo: remove mock functionality
  const [items, setItems] = useState<ListItem[]>([
    { id: '1', title: 'Milk', aisle: 'Dairy', purchased: false, assignedTo: { initials: 'SJ', color: 'hsl(30, 75%, 55%)' } },
    { id: '2', title: 'Whole Wheat Bread', note: 'Organic preferred', purchased: true },
    { id: '3', title: 'Eggs', aisle: 'Dairy', purchased: false },
    { id: '4', title: 'Fresh Apples', note: 'Gala or Fuji', purchased: false, assignedTo: { initials: 'MJ', color: 'hsl(150, 60%, 50%)' } },
    { id: '5', title: 'Chicken Breast', aisle: 'Meat', purchased: false },
  ]);
  const [newItem, setNewItem] = useState('');

  const handleToggle = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
    console.log('Item toggled:', id);
  };

  const handleAdd = () => {
    if (newItem.trim()) {
      setItems(prev => [...prev, {
        id: Date.now().toString(),
        title: newItem,
        purchased: false
      }]);
      setNewItem('');
      console.log('Item added:', newItem);
    }
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    console.log('Item deleted:', id);
  };

  const activeItems = items.filter(item => !item.purchased);
  const completedItems = items.filter(item => item.purchased);

  return (
    <div className="space-y-6" data-testid="page-lists">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shopping Lists</h1>
          <p className="text-muted-foreground mt-1">Grocery List</p>
        </div>
        <Button variant="outline" data-testid="button-new-list">
          <Plus className="h-4 w-4 mr-2" />
          New List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Active Items ({activeItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeItems.map((item) => (
            <div 
              key={item.id} 
              className="flex items-start gap-3 p-3 rounded-md hover-elevate group"
              data-testid={`list-item-${item.id}`}
            >
              <Checkbox 
                checked={item.purchased}
                onCheckedChange={() => handleToggle(item.id)}
                data-testid={`checkbox-item-${item.id}`}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium" data-testid={`text-item-title-${item.id}`}>{item.title}</p>
                {item.note && (
                  <p className="text-sm text-muted-foreground">{item.note}</p>
                )}
                {item.aisle && (
                  <p className="text-xs text-muted-foreground mt-1">Aisle: {item.aisle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {item.assignedTo && (
                  <Avatar className="h-7 w-7">
                    <AvatarFallback style={{ backgroundColor: item.assignedTo.color }} className="text-white text-xs">
                      {item.assignedTo.initials}
                    </AvatarFallback>
                  </Avatar>
                )}
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(item.id)}
                  data-testid={`button-delete-${item.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="flex gap-2 pt-3 border-t">
            <Input 
              placeholder="Add new item..." 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              data-testid="input-new-item"
              className="flex-1"
            />
            <Button onClick={handleAdd} data-testid="button-add-item">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {completedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Completed ({completedItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-3 p-2 rounded-md opacity-60"
                data-testid={`completed-item-${item.id}`}
              >
                <Checkbox checked={true} onCheckedChange={() => handleToggle(item.id)} />
                <span className="flex-1 text-sm line-through">{item.title}</span>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

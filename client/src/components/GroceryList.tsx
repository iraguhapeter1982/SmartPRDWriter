import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

interface ListItem {
  id: string;
  title: string;
  purchased: boolean;
  assignedTo?: {
    initials: string;
    color: string;
  };
}

interface GroceryListProps {
  items?: ListItem[];
}

export default function GroceryList({ items: initialItems = [] }: GroceryListProps) {
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [newItem, setNewItem] = useState('');

  const handleToggle = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
    console.log('Item toggled:', id);
  };

  const handleAdd = () => {
    if (newItem.trim()) {
      const item: ListItem = {
        id: Date.now().toString(),
        title: newItem,
        purchased: false
      };
      setItems(prev => [...prev, item]);
      setNewItem('');
      console.log('Item added:', newItem);
    }
  };

  return (
    <Card data-testid="card-grocery-list">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Grocery List</CardTitle>
        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No items in your list</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-3 p-2 rounded-md hover-elevate"
                data-testid={`list-item-${item.id}`}
              >
                <Checkbox 
                  checked={item.purchased}
                  onCheckedChange={() => handleToggle(item.id)}
                  data-testid={`checkbox-item-${item.id}`}
                />
                <span 
                  className={`flex-1 text-sm ${item.purchased ? 'line-through text-muted-foreground' : ''}`}
                  data-testid={`text-item-title-${item.id}`}
                >
                  {item.title}
                </span>
                {item.assignedTo && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback style={{ backgroundColor: item.assignedTo.color }} className="text-white text-xs">
                      {item.assignedTo.initials}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Input 
            placeholder="Add item..." 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            data-testid="input-new-item"
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={handleAdd}
            data-testid="button-add-item"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

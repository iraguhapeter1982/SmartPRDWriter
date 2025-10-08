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
    }
  };

  const activeItems = items.filter(item => !item.purchased);
  const completedItems = items.filter(item => item.purchased);

  return (
    <Card data-testid="card-grocery-list" className="shadow-sm border-0">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Shopping List</CardTitle>
        <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 p-2">
          <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
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

        {items.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <ShoppingCart className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No items in your list</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeItems.length > 0 && (
              <div className="space-y-1.5">
                {activeItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 p-2.5 rounded-lg hover-elevate transition-all duration-200"
                    data-testid={`list-item-${item.id}`}
                  >
                    <Checkbox 
                      checked={item.purchased}
                      onCheckedChange={() => handleToggle(item.id)}
                      data-testid={`checkbox-item-${item.id}`}
                    />
                    <span 
                      className="flex-1 text-sm font-medium"
                      data-testid={`text-item-title-${item.id}`}
                    >
                      {item.title}
                    </span>
                    {item.assignedTo && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback style={{ backgroundColor: item.assignedTo.color }} className="text-white text-xs font-medium">
                          {item.assignedTo.initials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            )}

            {completedItems.length > 0 && (
              <div className="pt-2 border-t space-y-1.5">
                {completedItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 p-2.5 rounded-lg hover-elevate opacity-60 transition-all duration-200"
                    data-testid={`list-item-${item.id}`}
                  >
                    <Checkbox 
                      checked={item.purchased}
                      onCheckedChange={() => handleToggle(item.id)}
                      data-testid={`checkbox-item-${item.id}`}
                    />
                    <span 
                      className="flex-1 text-sm line-through text-muted-foreground"
                      data-testid={`text-item-title-${item.id}`}
                    >
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

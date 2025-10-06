import GroceryList from '../GroceryList';

export default function GroceryListExample() {
  const mockItems = [
    { id: '1', title: 'Milk', purchased: false, assignedTo: { initials: 'SJ', color: 'hsl(30, 75%, 55%)' } },
    { id: '2', title: 'Bread', purchased: true },
    { id: '3', title: 'Eggs', purchased: false },
    { id: '4', title: 'Apples', purchased: false, assignedTo: { initials: 'MJ', color: 'hsl(150, 60%, 50%)' } }
  ];

  return <GroceryList items={mockItems} />;
}

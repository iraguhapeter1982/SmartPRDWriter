import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';

const AVATAR_COLORS = [
  'hsl(30, 75%, 55%)',
  'hsl(150, 60%, 50%)',
  'hsl(270, 65%, 60%)',
  'hsl(340, 70%, 58%)',
  'hsl(210, 70%, 55%)',
  'hsl(45, 80%, 55%)',
  'hsl(330, 70%, 60%)',
  'hsl(180, 60%, 50%)',
];

interface FamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: {
    id: string;
    name: string;
    role: string | null;
    birthYear: number | null;
    color: string | null;
  };
  familyId: string;
}

export default function FamilyMemberDialog({ open, onOpenChange, member, familyId }: FamilyMemberDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('child');
  const [birthYear, setBirthYear] = useState('');
  const [color, setColor] = useState(AVATAR_COLORS[0]);

  // Reset form when dialog opens or member changes
  useEffect(() => {
    if (open) {
      if (member) {
        setName(member.name);
        setRole(member.role || 'child');
        setBirthYear(member.birthYear?.toString() || '');
        setColor(member.color || AVATAR_COLORS[0]);
      } else {
        setName('');
        setRole('child');
        setBirthYear('');
        setColor(AVATAR_COLORS[0]);
      }
    }
  }, [open, member]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const data: any = {
        familyId,
        name: name.trim(),
        role,
        color,
      };

      if (birthYear) {
        const year = parseInt(birthYear);
        if (year > 1900 && year <= new Date().getFullYear()) {
          data.birthYear = year;
        }
      }

      if (member) {
        await apiRequest('PATCH', `/api/family-members/${member.id}`, data);
        toast({
          title: 'Success',
          description: 'Family member updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/family-members', data);
        toast({
          title: 'Success',
          description: 'Family member added successfully',
        });
      }

      queryClient.invalidateQueries({ queryKey: ['/api/family-members'] });
      onOpenChange(false);
      setName('');
      setRole('child');
      setBirthYear('');
      setColor(AVATAR_COLORS[0]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member ? 'Edit Family Member' : 'Add Family Member'}</DialogTitle>
          <DialogDescription>
            {member ? 'Update family member information' : 'Add a new member to your family'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              data-testid="input-member-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger data-testid="select-member-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthYear">Birth Year (Optional)</Label>
            <Input
              id="birthYear"
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="2015"
              min="1900"
              max={new Date().getFullYear()}
              data-testid="input-birth-year"
            />
          </div>

          <div className="space-y-2">
            <Label>Avatar Color</Label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-full border-2 transition-all ${
                    color === c ? 'border-primary scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  data-testid={`color-${c}`}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} data-testid="button-save-member">
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

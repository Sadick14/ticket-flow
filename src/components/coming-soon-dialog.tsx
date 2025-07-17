
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

interface ComingSoonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComingSoonDialog({ isOpen, onOpenChange }: ComingSoonDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Coming Soon!</DialogTitle>
          <DialogDescription className="mt-2 text-base text-muted-foreground">
            This feature is currently under development. We're working hard to bring it to you. Stay tuned!
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Button onClick={() => onOpenChange(false)}>Got it, thanks!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

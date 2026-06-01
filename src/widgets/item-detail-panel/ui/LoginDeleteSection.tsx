import { Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';

type LoginDeleteSectionProps = {
  title: string;
  isDeletingItem: boolean;
  deleteError: string | null;
  onDelete: () => void;
};

export function LoginDeleteSection({
  title,
  isDeletingItem,
  deleteError,
  onDelete,
}: LoginDeleteSectionProps) {
  return (
    <div className="border-t pt-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isDeletingItem}>
            <Trash2 className="size-4" />
            {isDeletingItem ? 'Deleting...' : 'Delete login'}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete login item?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete “{title}”? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingItem}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeletingItem}
              onClick={onDelete}
            >
              {isDeletingItem ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {deleteError ? (
        <p className="mt-2 text-xs text-destructive">{deleteError}</p>
      ) : null}
    </div>
  );
}

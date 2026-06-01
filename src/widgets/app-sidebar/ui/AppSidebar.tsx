import { ShieldCheck } from 'lucide-react';

import type { VaultItemType } from '@/entities/item';
import { LockVaultButton } from '@/features/lock-vault';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

export type SidebarItemTypeFilter = VaultItemType | 'all';

export type SidebarItemTypeCounts = Record<SidebarItemTypeFilter, number>;

type AppSidebarProps = {
  selectedItemType: SidebarItemTypeFilter;
  itemTypeCounts: SidebarItemTypeCounts;
  onSelectItemType: (type: SidebarItemTypeFilter) => void;
  onLock: () => void;
};

const itemTypeFilters: Array<{
  value: SidebarItemTypeFilter;
  label: string;
}> = [
  {
    value: 'all',
    label: 'All items',
  },
  {
    value: 'login',
    label: 'Logins',
  },
  {
    value: 'totp',
    label: 'TOTP',
  },
  {
    value: 'seed_phrase',
    label: 'Seed phrases',
  },
  {
    value: 'secure_note',
    label: 'Secure notes',
  },
];

export function AppSidebar({
  selectedItemType,
  itemTypeCounts,
  onSelectItemType,
  onLock,
}: AppSidebarProps) {
  return (
    <aside className="flex min-h-screen flex-col border-r bg-muted/30 p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="size-4" />
        </div>

        <div>
          <p className="text-sm font-semibold">Secure Vault</p>
          <p className="text-xs text-muted-foreground">Unlocked</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {itemTypeFilters.map((filter) => {
          const isSelected = filter.value === selectedItemType;
          const count = itemTypeCounts[filter.value];

          return (
            <Button
              key={filter.value}
              type="button"
              variant={isSelected ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-between',
                isSelected && 'font-medium',
              )}
              onClick={() => onSelectItemType(filter.value)}
            >
              <span>{filter.label}</span>
              <Badge variant={isSelected ? 'default' : 'secondary'}>
                {count}
              </Badge>
            </Button>
          );
        })}
      </nav>

      <div className="mt-8 flex flex-col gap-1">
        <Button variant="ghost" className="justify-start">
          Security Center
        </Button>
        <Button variant="ghost" className="justify-start">
          Backup
        </Button>
        <Button variant="ghost" className="justify-start">
          Settings
        </Button>
      </div>

      <div className="mt-auto pt-8">
        <LockVaultButton onLocked={onLock} />
      </div>
    </aside>
  );
}

import type { ReactNode } from 'react';

type VaultLayoutProps = {
  sidebar: ReactNode;
  itemList: ReactNode;
  detailPanel: ReactNode;
};

export function VaultLayout({
  sidebar,
  itemList,
  detailPanel,
}: VaultLayoutProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[260px_360px_1fr]">
        {sidebar}
        {itemList}
        {detailPanel}
      </div>
    </main>
  );
}

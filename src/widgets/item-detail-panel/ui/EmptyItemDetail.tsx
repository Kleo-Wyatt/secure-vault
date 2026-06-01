import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export function EmptyItemDetail() {
  return (
    <section className="p-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>No item selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select an item from the list to view encrypted details.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

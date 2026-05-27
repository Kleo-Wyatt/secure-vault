import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

export function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Secure Vault</CardTitle>
            <CardDescription>
              Local encrypted vault for passwords, 2FA secrets, and seed
              phrases.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <Button>Create vault</Button>
            <Button variant="outline">Unlock vault</Button>

            <p className="pt-2 text-xs text-muted-foreground">
              Your master password cannot be recovered. All sensitive data will
              be encrypted locally.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

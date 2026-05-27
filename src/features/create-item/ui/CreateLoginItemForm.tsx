import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type CreateLoginItemFormProps = {
  onBack: () => void;
  onCreated: () => void;
};

export function CreateLoginItemForm({
  onBack,
  onCreated,
}: CreateLoginItemFormProps) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const canSubmit = title.trim().length > 0 && password.length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    // TODO: call Tauri command create_item
    console.log({
      type: 'login',
      title,
      username,
      password,
      website,
      notes,
    });

    onCreated();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="login-title">
          Title
        </label>
        <Input
          id="login-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Binance"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="login-username">
          Username or email
        </label>
        <Input
          id="login-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="name@example.com"
          autoComplete="username"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="login-password">
          Password
        </label>

        <div className="flex gap-2">
          <Input
            id="login-password"
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            autoComplete="new-password"
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            onClick={() => setIsPasswordVisible((value) => !value)}
          >
            {isPasswordVisible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Password will be encrypted before it is saved.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="login-website">
          Website
        </label>
        <Input
          id="login-website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          placeholder="https://example.com"
          autoComplete="url"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="login-notes">
          Notes
        </label>
        <Textarea
          id="login-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Encrypted notes..."
          rows={4}
        />
      </div>

      <div className="flex gap-2 border-t pt-4">
        <Button className="flex-1" type="submit" disabled={!canSubmit}>
          Create login
        </Button>
        <Button type="button" variant="outline" onClick={onBack}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

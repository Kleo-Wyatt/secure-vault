import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type CredentialItemTextFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  errorMessage?: string | null;
  onChange: (value: string) => void;
};

export function CredentialItemTextField({
  id,
  label,
  value,
  placeholder,
  autoComplete,
  autoFocus,
  errorMessage,
  onChange,
}: CredentialItemTextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? errorId : undefined}
      />

      {errorMessage ? (
        <p id={errorId} className="text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

type CredentialItemPasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  helpText: string;
  isVisible: boolean;
  onChange: (value: string) => void;
  onToggleVisible: () => void;
};

export function CredentialItemPasswordField({
  id,
  label,
  value,
  placeholder,
  helpText,
  isVisible,
  onChange,
  onToggleVisible,
}: CredentialItemPasswordFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>

      <div className="flex gap-2">
        <Input
          id={id}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          onClick={onToggleVisible}
        >
          {isVisible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{helpText}</p>
    </div>
  );
}

type CredentialItemTextareaFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
};

export function CredentialItemTextareaField({
  id,
  label,
  value,
  placeholder,
  rows = 4,
  onChange,
}: CredentialItemTextareaFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

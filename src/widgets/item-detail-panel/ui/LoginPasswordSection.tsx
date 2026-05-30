import { Button } from '@/shared/ui/button';

type LoginPasswordSectionProps = {
  passwordMasked: string;
  revealedPassword: string | null;
  isRevealingPassword: boolean;
  isCopyingPassword: boolean;
  revealError: string | null;
  onRevealPassword: () => void;
  onHidePassword: () => void;
  onCopyPassword: () => void;
};

export function LoginPasswordSection({
  passwordMasked,
  revealedPassword,
  isRevealingPassword,
  isCopyingPassword,
  revealError,
  onRevealPassword,
  onHidePassword,
  onCopyPassword,
}: LoginPasswordSectionProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">Password</p>

      {revealedPassword ? (
        <input
          className="mt-2 h-10 w-full rounded-lg border bg-muted/40 px-3 font-mono text-sm outline-none selection:bg-primary selection:text-primary-foreground"
          value={revealedPassword}
          spellCheck={false}
          readOnly
          aria-label="Revealed password"
          onFocus={(event) => event.currentTarget.select()}
        />
      ) : (
        <code className="mt-2 block rounded-lg border bg-muted/40 px-3 py-2 font-mono text-sm">
          {passwordMasked}
        </code>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {revealedPassword ? (
          <Button variant="ghost" size="sm" onClick={onHidePassword}>
            Hide
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRevealPassword}
            disabled={isRevealingPassword}
          >
            {isRevealingPassword ? 'Revealing...' : 'Reveal'}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onCopyPassword}
          disabled={isCopyingPassword}
        >
          {isCopyingPassword ? 'Copying...' : 'Copy'}
        </Button>
      </div>

      {revealedPassword ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Password will be hidden automatically after 20 seconds. Focus the
          field to select and copy the full value.
        </p>
      ) : null}

      {revealError ? (
        <p className="mt-2 text-xs text-destructive">{revealError}</p>
      ) : null}
    </div>
  );
}

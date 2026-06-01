import { AlertCircle, Copy } from 'lucide-react';

import { Button } from '@/shared/ui/button';

type TotpCodeSectionProps = {
  code: string | null;
  expiresIn: number | null;
  isLoadingCode: boolean;
  isCopyingCode: boolean;
  codeError: string | null;
  copyMessage: string | null;
  onRetryCode: () => void;
  onCopyCode: () => void;
};

function formatTotpCode(code: string) {
  if (code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }

  if (code.length === 8) {
    return `${code.slice(0, 4)} ${code.slice(4)}`;
  }

  return code;
}

export function TotpCodeSection({
  code,
  expiresIn,
  isLoadingCode,
  isCopyingCode,
  codeError,
  copyMessage,
  onRetryCode,
  onCopyCode,
}: TotpCodeSectionProps) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Current code</p>

          {code ? (
            <p className="mt-2 font-mono text-3xl font-semibold tracking-widest">
              {formatTotpCode(code)}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {isLoadingCode ? 'Generating code...' : 'No code generated yet.'}
            </p>
          )}
        </div>

        {code ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isCopyingCode}
            onClick={onCopyCode}
          >
            <Copy className="size-4" />
            {isCopyingCode ? 'Copying...' : 'Copy'}
          </Button>
        ) : null}
      </div>

      {expiresIn !== null ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Refreshes automatically in {expiresIn}s.
        </p>
      ) : null}

      {copyMessage ? (
        <p className="mt-3 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {copyMessage}
        </p>
      ) : null}

      {codeError ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-destructive" />
            <p className="text-xs text-destructive">{codeError}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoadingCode}
            onClick={onRetryCode}
          >
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

import { Button } from '@/shared/ui/button';

type SecureNoteBodySectionProps = {
  bodyPreview?: string;
  revealedBody: string | null;
  isRevealingBody: boolean;
  revealError: string | null;
  onRevealBody: () => void;
  onHideBody: () => void;
};

export function SecureNoteBodySection({
  bodyPreview,
  revealedBody,
  isRevealingBody,
  revealError,
  onRevealBody,
  onHideBody,
}: SecureNoteBodySectionProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">Note</p>

      {revealedBody ? (
        <div className="mt-2 whitespace-pre-wrap rounded-lg border bg-muted/40 px-3 py-2 text-sm selection:bg-primary selection:text-primary-foreground">
          {revealedBody}
        </div>
      ) : (
        <code className="mt-2 block rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          {bodyPreview || 'Hidden until reveal.'}
        </code>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {revealedBody ? (
          <Button variant="ghost" size="sm" onClick={onHideBody}>
            Hide
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRevealBody}
            disabled={isRevealingBody}
          >
            {isRevealingBody ? 'Revealing...' : 'Reveal'}
          </Button>
        )}
      </div>

      {revealedBody ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Note body is loaded only after reveal.
        </p>
      ) : null}

      {revealError ? (
        <p className="mt-2 text-xs text-destructive">{revealError}</p>
      ) : null}
    </div>
  );
}

import { useState } from 'react';

import { normalizeExternalUrl, openExternalUrl } from '@/features/open-url';

type CredentialMetadataSectionProps = {
  username?: string;
  website?: string;
  notes?: string;
};

export function CredentialMetadataSection({
  username,
  website,
  notes,
}: CredentialMetadataSectionProps) {
  const [openWebsiteError, setOpenWebsiteError] = useState<string | null>(null);

  const normalizedWebsiteUrl = website ? normalizeExternalUrl(website) : null;

  async function handleOpenWebsite() {
    if (!website) {
      return;
    }

    setOpenWebsiteError(null);

    try {
      await openExternalUrl(website);
    } catch {
      setOpenWebsiteError('Could not open website.');
    }
  }

  return (
    <>
      <div>
        <p className="text-xs text-muted-foreground">Username</p>
        <p className="text-sm">{username || 'Not set'}</p>
      </div>

      {website ? (
        <div>
          <p className="text-xs text-muted-foreground">Website</p>

          {normalizedWebsiteUrl ? (
            <button
              type="button"
              className="mt-1 cursor-pointer rounded-sm text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={handleOpenWebsite}
            >
              {website}
            </button>
          ) : (
            <>
              <p className="mt-1 text-sm">{website}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Website is saved, but it is not a valid http or https URL.
              </p>
            </>
          )}

          {openWebsiteError ? (
            <p className="mt-2 text-xs text-destructive">{openWebsiteError}</p>
          ) : null}
        </div>
      ) : null}

      {notes ? (
        <div>
          <p className="text-xs text-muted-foreground">Notes</p>
          <p className="text-sm whitespace-pre-wrap">{notes}</p>
        </div>
      ) : null}
    </>
  );
}

type LoginMetadataSectionProps = {
  username?: string;
  website?: string;
  notes?: string;
};

export function LoginMetadataSection({
  username,
  website,
  notes,
}: LoginMetadataSectionProps) {
  return (
    <>
      <div>
        <p className="text-xs text-muted-foreground">Username</p>
        <p className="text-sm">{username || 'Not set'}</p>
      </div>

      {website ? (
        <div>
          <p className="text-xs text-muted-foreground">Website</p>
          <p className="text-sm">{website}</p>
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

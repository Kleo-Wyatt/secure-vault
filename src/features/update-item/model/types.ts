export type UpdateCredentialItemInput = {
  title: string;
  username?: string;
  password?: string;
  website?: string;
  notes?: string;
};

export type UpdateSecureNoteItemInput = {
  title: string;
  body: string;
};

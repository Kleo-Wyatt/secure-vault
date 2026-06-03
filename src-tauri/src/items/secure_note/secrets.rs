use crate::crypto::vault_key::VaultKey;
use crate::items::payloads::decrypt_secure_note_payload;
use crate::items::repository::VaultItemRepository;

pub fn read_secure_note_body(
    repository: &VaultItemRepository<'_>,
    item_id: &str,
    vault_key: &VaultKey,
    error_message: &str,
) -> Result<String, String> {
    let file_item = repository.find_file_item(item_id)?;

    let payload = decrypt_secure_note_payload(&file_item, vault_key)
        .map_err(|_| error_message.to_string())?;

    Ok(payload.body)
}

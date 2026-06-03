use crate::crypto::vault_key::VaultKey;
use crate::items::login::mapping::LEGACY_CREDENTIAL_ITEM_TYPE;
use crate::items::payloads::decrypt_credential_payload;
use crate::items::repository::VaultItemRepository;

pub fn read_credential_password(
    repository: &VaultItemRepository<'_>,
    item_id: &str,
    vault_key: &VaultKey,
    error_message: &str,
) -> Result<String, String> {
    let file_item = repository.find_file_item(item_id)?;

    let payload =
        decrypt_credential_payload(&file_item, vault_key).map_err(|_| error_message.to_string())?;

    Ok(payload.password)
}

pub fn delete_credential_file_item(
    repository: &VaultItemRepository<'_>,
    item_id: &str,
) -> Result<(), String> {
    repository.delete_file_item_of_type(item_id, LEGACY_CREDENTIAL_ITEM_TYPE)
}

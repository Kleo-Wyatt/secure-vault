use crate::items::repository::VaultItemRepository;
use crate::items::secure_note::mapping::SECURE_NOTE_ITEM_TYPE;

pub fn delete_secure_note_file_item(
    repository: &VaultItemRepository<'_>,
    item_id: &str,
) -> Result<(), String> {
    repository.delete_file_item_of_type(item_id, SECURE_NOTE_ITEM_TYPE)
}

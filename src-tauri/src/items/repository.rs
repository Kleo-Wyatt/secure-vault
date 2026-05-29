use chrono::Utc;

use crate::vault::format::{VaultFile, VaultFileItem};
use crate::vault::storage::{load_vault_file, save_vault_file};

pub struct VaultItemRepository<'a> {
    app: &'a tauri::AppHandle,
}

impl<'a> VaultItemRepository<'a> {
    pub fn new(app: &'a tauri::AppHandle) -> Self {
        Self { app }
    }

    pub fn find_file_item(&self, item_id: &str) -> Result<VaultFileItem, String> {
        let vault_file = load_vault_file(self.app)?;

        vault_file
            .items
            .iter()
            .find(|item| item.id == item_id)
            .cloned()
            .ok_or_else(|| "Item not found.".to_string())
    }

    pub fn insert_file_item(&self, file_item: VaultFileItem) -> Result<(), String> {
        self.update_vault_file(|vault_file| {
            vault_file.items.insert(0, file_item);
            Ok(())
        })
    }

    pub fn replace_file_item(&self, item_id: &str, file_item: VaultFileItem) -> Result<(), String> {
        self.update_vault_file(|vault_file| {
            let item_index = vault_file
                .items
                .iter()
                .position(|item| item.id == item_id)
                .ok_or_else(|| "Item not found.".to_string())?;

            vault_file.items[item_index] = file_item;

            Ok(())
        })
    }

    pub fn delete_file_item_of_type(&self, item_id: &str, item_type: &str) -> Result<(), String> {
        self.update_vault_file(|vault_file| {
            let item_index = vault_file
                .items
                .iter()
                .position(|item| item.id == item_id)
                .ok_or_else(|| "Item not found.".to_string())?;

            if vault_file.items[item_index].item_type != item_type {
                return Err("Unsupported item type.".to_string());
            }

            vault_file.items.remove(item_index);

            Ok(())
        })
    }

    fn update_vault_file<T>(
        &self,
        update: impl FnOnce(&mut VaultFile) -> Result<T, String>,
    ) -> Result<T, String> {
        let mut vault_file = load_vault_file(self.app)?;
        let result = update(&mut vault_file)?;

        vault_file.updated_at = Utc::now().to_rfc3339();

        save_vault_file(self.app, &vault_file)?;

        Ok(result)
    }
}

use std::sync::Mutex;

use crate::crypto::vault_key::VaultKey;
use crate::items::model::VaultItemDetail;

#[derive(Debug, Default)]
pub struct AppState {
    pub vault: Mutex<VaultRuntimeState>,
}

#[derive(Debug, Default)]
pub struct VaultRuntimeState {
    pub is_unlocked: bool,
    pub vault_key: Option<VaultKey>,
    pub items: Vec<VaultItemDetail>,
}

impl VaultRuntimeState {
    pub fn unlock(&mut self, vault_key: VaultKey) {
        self.is_unlocked = true;
        self.vault_key = Some(vault_key);
        self.items.clear();
    }

    pub fn lock(&mut self) {
        self.is_unlocked = false;
        self.vault_key = None;
        self.items.clear();
    }

    pub fn require_unlocked(&self) -> Result<&VaultKey, String> {
        if !self.is_unlocked {
            return Err("Vault is locked.".to_string());
        }

        self.vault_key
            .as_ref()
            .ok_or_else(|| "Vault is locked.".to_string())
    }
}

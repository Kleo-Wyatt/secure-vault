use std::sync::Mutex;

use crate::items::model::VaultItemDetail;

#[derive(Debug, Default)]
pub struct AppState {
    pub vault: Mutex<VaultRuntimeState>,
}

#[derive(Debug, Default)]
pub struct VaultRuntimeState {
    pub is_unlocked: bool,
    pub items: Vec<VaultItemDetail>,
}

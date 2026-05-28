use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum VaultItemType {
    Login,
    Totp,
    SeedPhrase,
    SecureNote,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateLoginItemPayload {
    pub title: String,
    pub username: Option<String>,
    pub password: String,
    pub website: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultItemDetail {
    pub id: String,

    #[serde(rename = "type")]
    pub item_type: VaultItemType,

    pub title: String,
    pub description: String,

    pub username: Option<String>,
    pub password_masked: Option<String>,
    pub notes: Option<String>,

    pub is_high_security: Option<bool>,
}

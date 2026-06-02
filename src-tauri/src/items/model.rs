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
    pub totp: Option<CreateLoginItemTotpPayload>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateLoginItemTotpPayload {
    pub issuer: Option<String>,
    pub account: Option<String>,
    pub secret: String,
    pub algorithm: Option<String>,
    pub digits: Option<u8>,
    pub period: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateLoginItemPayload {
    pub title: String,
    pub username: Option<String>,
    pub password: Option<String>,
    pub website: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTotpItemPayload {
    pub title: String,
    pub issuer: Option<String>,
    pub account: String,
    pub secret: String,
    pub algorithm: Option<String>,
    pub digits: Option<u8>,
    pub period: Option<u32>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultItemDetail {
    pub id: String,
    pub list_id: Option<String>,

    #[serde(rename = "type")]
    pub item_type: VaultItemType,

    pub title: String,
    pub description: String,

    pub username: Option<String>,
    pub website: Option<String>,
    pub password_masked: Option<String>,

    pub issuer: Option<String>,
    pub account: Option<String>,
    pub algorithm: Option<String>,
    pub digits: Option<u8>,
    pub period: Option<u32>,
    pub code: Option<String>,
    pub expires_in: Option<u32>,
    pub has_totp: Option<bool>,

    pub notes: Option<String>,

    pub is_high_security: Option<bool>,
}

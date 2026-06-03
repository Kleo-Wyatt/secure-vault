use serde::{Deserialize, Serialize};

use crate::items::model::{
    CreateCredentialItemPayload, CreateSecureNoteItemPayload, CreateTotpItemPayload,
    UpdateCredentialItemPayload, UpdateSecureNoteItemPayload,
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateItemArgs {
    pub item_type: String,
    pub list_id: Option<String>,

    #[serde(default, alias = "login")]
    pub credential: Option<CreateCredentialItemPayload>,

    pub totp: Option<CreateTotpItemPayload>,

    pub secure_note: Option<CreateSecureNoteItemPayload>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateItemArgs {
    pub id: String,
    pub item_type: String,

    #[serde(default, alias = "login")]
    pub credential: Option<UpdateCredentialItemPayload>,

    pub secure_note: Option<UpdateSecureNoteItemPayload>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RevealSecretArgs {
    pub id: String,
    pub secret_type: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CopySecretArgs {
    pub id: String,
    pub secret_type: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteItemArgs {
    pub id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateTotpCodeArgs {
    pub id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CopyTotpCodeArgs {
    pub id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RevealSecretResult {
    pub value: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateTotpCodeResult {
    pub code: String,
    pub expires_in: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClipboardClearedEvent {
    pub success: bool,
    pub reason: String,
}

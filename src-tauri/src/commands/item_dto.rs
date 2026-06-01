use serde::{Deserialize, Serialize};

use crate::items::model::{CreateLoginItemPayload, UpdateLoginItemPayload};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateItemArgs {
    pub item_type: String,
    pub login: Option<CreateLoginItemPayload>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateItemArgs {
    pub id: String,
    pub item_type: String,
    pub login: Option<UpdateLoginItemPayload>,
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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RevealSecretResult {
    pub value: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClipboardClearedEvent {
    pub success: bool,
    pub reason: String,
}

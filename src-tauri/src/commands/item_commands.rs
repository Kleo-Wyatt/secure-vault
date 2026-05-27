use serde::{ Deserialize, Serialize };
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateItemArgs {
    pub item_type: String,
    pub login: Option<CreateLoginItemPayload>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateLoginItemPayload {
    pub title: String,
    pub username: Option<String>,
    pub password: String,
    pub website: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatedItem {
    pub id: String,

    #[serde(rename = "type")]
    pub item_type: String,

    pub title: String,
    pub description: String,
    pub username: Option<String>,
    pub password_masked: Option<String>,
    pub notes: Option<String>,
    pub is_high_security: Option<bool>,
}

#[tauri::command]
pub async fn create_item(args: CreateItemArgs) -> Result<CreatedItem, String> {
    match args.item_type.as_str() {
        "login" => {
            let Some(login) = args.login else {
                return Err("Login payload is required.".to_string());
            };

            if login.title.trim().is_empty() {
                return Err("Title is required.".to_string());
            }

            if login.password.is_empty() {
                return Err("Password is required.".to_string());
            }

            // TODO: encrypt and persist item payload.
            // IMPORTANT: never log login.password.

            Ok(CreatedItem {
                id: Uuid::new_v4().to_string(),
                item_type: "login".to_string(),
                title: login.title.trim().to_string(),
                description: login.website
                    .filter(|value| !value.trim().is_empty())
                    .unwrap_or_else(|| "Login".to_string()),
                username: login.username.filter(|value| !value.trim().is_empty()),
                password_masked: Some("••••••••••••••••".to_string()),
                notes: login.notes.filter(|value| !value.trim().is_empty()),
                is_high_security: None,
            })
        }
        _ => Err("Unsupported item type.".to_string()),
    }
}

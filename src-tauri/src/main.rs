mod clipboard;
mod commands;
mod crypto;
mod items;
mod state;
mod vault;

use commands::item_commands::{
    copy_secret, create_item, delete_item, generate_totp_code, list_items, reveal_secret,
    update_item,
};
use commands::vault_commands::{create_vault, lock_vault, unlock_vault};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(state::AppState::default())
        .invoke_handler(tauri::generate_handler![
            create_vault,
            unlock_vault,
            lock_vault,
            create_item,
            update_item,
            list_items,
            reveal_secret,
            copy_secret,
            generate_totp_code,
            delete_item
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

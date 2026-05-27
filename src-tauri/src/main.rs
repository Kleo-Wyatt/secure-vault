mod commands;

use commands::vault_commands::{ create_vault, lock_vault, unlock_vault };

fn main() {
    tauri::Builder
        ::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![create_vault, unlock_vault, lock_vault])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

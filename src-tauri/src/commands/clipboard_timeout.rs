use std::time::Duration;

use tauri::Emitter;

use crate::clipboard::clear_secret_clipboard;
use crate::commands::item_dto::ClipboardClearedEvent;

pub fn schedule_clipboard_clear(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_secs(20));

        let success = clear_secret_clipboard().is_ok();

        let _ = app.emit(
            "clipboard-cleared",
            ClipboardClearedEvent {
                success,
                reason: "timeout".to_string(),
            },
        );
    });
}

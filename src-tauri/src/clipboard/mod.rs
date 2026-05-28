#[cfg(target_os = "windows")]
mod windows;

#[derive(Debug, Clone, Copy)]
pub struct ClipboardWrite {
    pub sequence_number: Option<u32>,
}

#[cfg(target_os = "windows")]
pub fn copy_secret_text(value: &str) -> Result<ClipboardWrite, String> {
    windows::copy_secret_text(value)
}

#[cfg(target_os = "windows")]
pub fn clear_secret_clipboard(sequence_number: Option<u32>) -> Result<(), String> {
    windows::clear_secret_clipboard(sequence_number)
}

#[cfg(not(target_os = "windows"))]
pub fn copy_secret_text(_value: &str) -> Result<ClipboardWrite, String> {
    Err("Secret clipboard copy is not implemented for this platform yet.".to_string())
}

#[cfg(not(target_os = "windows"))]
pub fn clear_secret_clipboard(_sequence_number: Option<u32>) -> Result<(), String> {
    Ok(())
}

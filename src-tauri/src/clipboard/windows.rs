use std::ptr::null_mut;

use windows_sys::Win32::System::DataExchange::{
    CloseClipboard, EmptyClipboard, OpenClipboard, RegisterClipboardFormatW, SetClipboardData,
};
use windows_sys::Win32::System::Memory::{GlobalAlloc, GlobalLock, GlobalUnlock, GMEM_MOVEABLE};

const CF_UNICODETEXT: u32 = 13;
const EXCLUDE_CLIPBOARD_HISTORY_FORMAT: &str = "ExcludeClipboardContentFromMonitorProcessing";

struct ClipboardGuard;

impl Drop for ClipboardGuard {
    fn drop(&mut self) {
        unsafe {
            CloseClipboard();
        }
    }
}

pub fn copy_secret_text(value: &str) -> Result<(), String> {
    if value.is_empty() {
        return Err("Clipboard value is empty.".to_string());
    }

    unsafe {
        let _clipboard = open_clipboard()?;

        EmptyClipboard();

        set_unicode_text(value)?;
        set_exclude_from_clipboard_history_marker()?;

        Ok(())
    }
}

pub fn clear_secret_clipboard() -> Result<(), String> {
    unsafe {
        let _clipboard = open_clipboard()?;

        EmptyClipboard();

        Ok(())
    }
}

unsafe fn open_clipboard() -> Result<ClipboardGuard, String> {
    if OpenClipboard(null_mut()) == 0 {
        return Err("Could not open clipboard.".to_string());
    }

    Ok(ClipboardGuard)
}

unsafe fn set_unicode_text(value: &str) -> Result<(), String> {
    let text: Vec<u16> = value.encode_utf16().chain(std::iter::once(0)).collect();
    let byte_len = text.len() * std::mem::size_of::<u16>();

    let handle = GlobalAlloc(GMEM_MOVEABLE, byte_len);

    if handle.is_null() {
        return Err("Could not allocate clipboard memory.".to_string());
    }

    let memory = GlobalLock(handle) as *mut u16;

    if memory.is_null() {
        return Err("Could not lock clipboard memory.".to_string());
    }

    std::ptr::copy_nonoverlapping(text.as_ptr(), memory, text.len());

    GlobalUnlock(handle);

    if SetClipboardData(CF_UNICODETEXT, handle).is_null() {
        return Err("Could not write clipboard text.".to_string());
    }

    Ok(())
}

unsafe fn set_exclude_from_clipboard_history_marker() -> Result<(), String> {
    let format_name: Vec<u16> = EXCLUDE_CLIPBOARD_HISTORY_FORMAT
        .encode_utf16()
        .chain(std::iter::once(0))
        .collect();

    let format = RegisterClipboardFormatW(format_name.as_ptr());

    if format == 0 {
        return Err("Could not register clipboard history exclusion format.".to_string());
    }

    let marker: u32 = 0;
    let byte_len = std::mem::size_of::<u32>();

    let handle = GlobalAlloc(GMEM_MOVEABLE, byte_len);

    if handle.is_null() {
        return Err("Could not allocate clipboard marker memory.".to_string());
    }

    let memory = GlobalLock(handle) as *mut u32;

    if memory.is_null() {
        return Err("Could not lock clipboard marker memory.".to_string());
    }

    std::ptr::write(memory, marker);

    GlobalUnlock(handle);

    if SetClipboardData(format, handle).is_null() {
        return Err("Could not write clipboard history exclusion marker.".to_string());
    }

    Ok(())
}

pub fn normalize_required_title(value: &str) -> Result<String, String> {
    let title = value.trim().to_string();

    if title.is_empty() {
        return Err("Title is required.".to_string());
    }

    Ok(title)
}

pub fn normalize_required_body(value: String) -> Result<String, String> {
    if value.trim().is_empty() {
        return Err("Note body is required.".to_string());
    }

    Ok(value)
}

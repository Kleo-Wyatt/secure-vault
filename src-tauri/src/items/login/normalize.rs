pub fn normalize_required_title(title: &str) -> Result<String, String> {
    let title = title.trim().to_string();

    if title.is_empty() {
        return Err("Title is required.".to_string());
    }

    Ok(title)
}

pub fn normalize_optional_text(value: Option<String>) -> Option<String> {
    value
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

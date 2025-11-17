// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::time::{SystemTime, UNIX_EPOCH};

#[tauri::command]
fn greet() -> String {
  let now = SystemTime::now();
  let epoch_ms = now.duration_since(UNIX_EPOCH).unwrap().as_millis();
  format!("Hello world from Rust! Current epoch: {epoch_ms}")
}

use std::path::PathBuf;
use lofty::prelude::TaggedFileExt;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use lofty::read_from_path;
use std::fs;
use lofty::file::AudioFile;

#[tauri::command]
async fn extract_cover_art(file_path: String) -> Result<Option<String>, String> {
    let path = PathBuf::from(file_path);
    
    // Read the audio file
    let tagged_file = read_from_path(&path)
        .map_err(|e| format!("Failed to read audio file: {}", e))?;
    
    // Extract the tag (metadata)
    let tag = match tagged_file.primary_tag() {
        Some(primary) => primary,
        None => {
            // Try to get any tag if primary doesn't exist
            tagged_file.first_tag()
                .ok_or_else(|| "No metadata found in audio file".to_string())?
        }
    };
    
    // Extract cover art (pictures)
    if let Some(picture) = tag.pictures().first() {
        // Determine MIME type from picture data
        let mime_type = match picture.mime_type() {
            Some(mime) => mime.to_string(),
            None => {
                // Try to infer from picture data
                if picture.data().starts_with(&[0xFF, 0xD8, 0xFF]) {
                    "image/jpeg".to_string()
                } else if picture.data().starts_with(&[0x89, 0x50, 0x4E, 0x47]) {
                    "image/png".to_string()
                } else {
                    "image/jpeg".to_string() // Default fallback
                }
            }
        };
        
        // Encode to base64 data URL
        let base64_data = BASE64.encode(picture.data());
        let data_url = format!("data:{};base64,{}", mime_type, base64_data);
        
        Ok(Some(data_url))
    } else {
        Ok(None)
    }
}

#[tauri::command]
async fn extract_cover_art_from_bytes(file_bytes: Vec<u8>, file_name: String) -> Result<Option<String>, String> {
    use std::env;
    
    // Create a temporary file
    let temp_dir = env::temp_dir();
    let temp_file_path = temp_dir.join(format!("nano_cover_extract_{}", file_name));
    
    // Write bytes to temp file
    fs::write(&temp_file_path, file_bytes)
        .map_err(|e| format!("extract_cover_art_from_bytes: Failed to write temp file: {}", e))?;
    
    // Extract cover art using the existing function
    let result = extract_cover_art(temp_file_path.to_string_lossy().to_string()).await;
    
    // Clean up temp file
    let _ = fs::remove_file(&temp_file_path);
    
    result
}

#[tauri::command]
async fn get_audio_duration(file_bytes: Vec<u8>, file_name: String) -> Result<i64, String> {
    use std::env;

    // Create a temporary file
    let temp_dir = env::temp_dir();
    let temp_file_path = temp_dir.join(format!("nano_audio_duration_{}", file_name));
    
    // Write bytes to temp file
    fs::write(&temp_file_path, file_bytes)
        .map_err(|e| format!("get_audio_duration: Failed to write temp file: {}", e))?;
    
    // Read the audio file
    let tagged_file = read_from_path(&temp_file_path)
        .map_err(|e| format!("get_audio_duration: Failed to read audio file: {}", e))?;
    
    // Get the duration from the audio properties
    let duration = tagged_file.properties().duration().as_secs_f64().round() as i64;
    
    // Clean up temp file
    let _ = fs::remove_file(&temp_file_path);
    
    Ok(duration)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, extract_cover_art, extract_cover_art_from_bytes, get_audio_duration])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

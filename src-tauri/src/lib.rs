use std::fs;
use std::io::Write;
use std::path::PathBuf;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// 保存文本内容到本地文件
#[tauri::command]
fn save_text_file(content: String, file_path: String) -> Result<(), String> {
    let path = PathBuf::from(&file_path);

    // 确保父目录存在
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
        }
    }

    // 写入文件
    let mut file = fs::File::create(&path).map_err(|e| format!("Failed to create file: {}", e))?;
    file.write_all(content.as_bytes()).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

/// 读取本地文件内容
#[tauri::command]
fn read_text_file(file_path: String) -> Result<String, String> {
    fs::read_to_string(&file_path).map_err(|e| format!("Failed to read file: {}", e))
}

/// 获取应用数据目录
#[tauri::command]
fn get_app_data_dir() -> Result<String, String> {
    let data_dir = dirs::data_local_dir()
        .ok_or_else(|| "Failed to get data directory".to_string())?;

    let app_dir = data_dir.join("task-manager");
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app directory: {}", e))?;
    }

    app_dir.to_str().ok_or_else(|| "Failed to convert path to string".to_string()).map(|s| s.to_string())
}

/// 显示系统通知（使用 AppHandle）
#[tauri::command]
fn show_notification(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;

    app.notification()
        .builder()
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| format!("Failed to show notification: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            save_text_file,
            read_text_file,
            get_app_data_dir,
            show_notification
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;

#[tauri::command]
fn docker_ps() -> Result<Vec<serde_json::Value>, String> {
    let output = Command::new("docker")
        .args(["ps", "-a", "--format", "{{json .}}"])
        .output()
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    let containers = stdout
        .lines()
        .filter(|l| !l.is_empty())
        .filter_map(|l| serde_json::from_str(l).ok())
        .collect();

    Ok(containers)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![docker_ps])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

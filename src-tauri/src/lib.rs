use std::fs;
use std::path::{Path, PathBuf};
use std::collections::HashMap;
use sha2::{Sha256, Digest};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub path: String,
    pub name: String,
    pub extension: String,
    pub size: u64,
    pub modified: i64,
    pub is_file: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanResult {
    pub files: Vec<FileInfo>,
    pub total_size: u64,
    pub file_count: usize,
    pub folder_count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DuplicateGroup {
    pub hash: String,
    pub files: Vec<FileInfo>,
    pub size: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileOperation {
    pub operation_type: String,
    pub source: String,
    pub destination: String,
    pub timestamp: i64,
    pub success: bool,
}

#[tauri::command]
async fn select_directory() -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;
    let Some(dialog) = tauri_plugin_dialog::Dialog::new(None) else {
        return Err("Failed to create dialog".to_string());
    };

    let Some(file_path) = dialog.file().pick_folder().await else {
        return Err("No directory selected".to_string());
    };

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn scan_directory(path: String) -> Result<ScanResult, String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err("Directory does not exist".to_string());
    }

    let mut files = Vec::new();
    let mut total_size = 0u64;
    let mut file_count = 0usize;
    let mut folder_count = 0usize;

    fn scan_dir(dir: &Path, files: &mut Vec<FileInfo>, total_size: &mut u64, file_count: &mut usize, folder_count: &mut usize) -> Result<(), String> {
        let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;

        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            let metadata = entry.metadata().map_err(|e| e.to_string())?;

            let name = path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("unknown")
                .to_string();

            let extension = path.extension()
                .and_then(|e| e.to_str())
                .unwrap_or("")
                .to_lowercase();

            let modified = metadata.modified()
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs() as i64)
                .unwrap_or(0);

            if metadata.is_file() {
                let size = metadata.len();
                *total_size += size;
                *file_count += 1;

                files.push(FileInfo {
                    path: path.to_string_lossy().to_string(),
                    name,
                    extension,
                    size,
                    modified,
                    is_file: true,
                });
            } else if metadata.is_dir() {
                *folder_count += 1;
                files.push(FileInfo {
                    path: path.to_string_lossy().to_string(),
                    name,
                    extension,
                    size: 0,
                    modified,
                    is_file: false,
                });

                if let Err(e) = scan_dir(&path, files, total_size, file_count, folder_count) {
                    eprintln!("Error scanning directory {:?}: {}", path, e);
                }
            }
        }

        Ok(())
    }

    scan_dir(path, &mut files, &mut total_size, &mut file_count, &mut folder_count)?;

    Ok(ScanResult {
        files,
        total_size,
        file_count,
        folder_count,
    })
}

#[tauri::command]
async fn compute_file_hash(path: String) -> Result<String, String> {
    let path = Path::new(&path);
    let contents = fs::read(path).map_err(|e| e.to_string())?;
    let mut hasher = Sha256::new();
    hasher.update(&contents);
    let result = hasher.finalize();
    Ok(format!("{:x}", result))
}

#[tauri::command]
async fn find_duplicates(files: Vec<FileInfo>) -> Result<Vec<DuplicateGroup>, String> {
    let mut hash_map: HashMap<String, Vec<FileInfo>> = HashMap::new();

    for file in files {
        if file.is_file {
            let hash = compute_file_hash(file.path.clone()).await?;
            hash_map.entry(hash).or_insert_with(Vec::new).push(file);
        }
    }

    let mut duplicates = Vec::new();
    for (hash, files) in hash_map {
        if files.len() > 1 {
            let size = files.first().map(|f| f.size).unwrap_or(0);
            duplicates.push(DuplicateGroup {
                hash,
                files,
                size,
            });
        }
    }

    Ok(duplicates)
}

#[tauri::command]
async fn move_file(source: String, destination: String) -> Result<bool, String> {
    let source_path = Path::new(&source);
    let dest_path = Path::new(&destination);

    if !source_path.exists() {
        return Err("Source file does not exist".to_string());
    }

    if dest_path.exists() {
        return Err("Destination already exists".to_string());
    }

    if let Some(parent) = dest_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }

    fs::rename(source_path, dest_path).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
async fn rename_file(old_path: String, new_name: String) -> Result<String, String> {
    let old_path = Path::new(&old_path);
    let new_path = old_path.with_file_name(&new_name);

    if !old_path.exists() {
        return Err("File does not exist".to_string());
    }

    if new_path.exists() {
        return Err("Target filename already exists".to_string());
    }

    fs::rename(old_path, &new_path).map_err(|e| e.to_string())?;
    Ok(new_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        select_directory,
        scan_directory,
        compute_file_hash,
        find_duplicates,
        move_file,
        rename_file
    ])
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}

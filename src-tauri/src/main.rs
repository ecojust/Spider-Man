// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod browser;

use browser::run_browser;

fn main() {
    //tauri_app_lib::run()
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![run_browser])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

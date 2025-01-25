use headless_chrome::Browser;
use headless_chrome::LaunchOptionsBuilder;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
fn open_browser() -> Browser {
    Browser::new(
        LaunchOptionsBuilder::default()
            .headless(true)
            .build()
            .unwrap(),
    )
    .unwrap()
}

#[tauri::command]
fn run_browser(param: &str) -> String {
    let path = format!("https://hifini.com/search-{}.htm", param);
    let browser = open_browser();
    let tab = browser.new_tab().unwrap();
    tab.navigate_to(&path).unwrap();

    // 找到 title 元素并获取其文本内容
    let title_node = tab.find_element("title").unwrap();
    let title_text = title_node.get_inner_text().unwrap();

    format!(
        "Hello, {}! You've been greeted from Rust! Here are the links on the page:\n{}",
        param, title_text
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![run_browser])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

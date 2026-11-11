/**
 * Cắt `dist-artifact/index.html` (một file do vite-plugin-singlefile gộp) thành phần nội dung
 * mà Claude artifact nhận: nền tảng tự bọc doctype/html/head/body, nên file xuất bản chỉ gồm
 * <title> + <style> + #root + <script>. Kết quả: `dist-artifact/my-ikame.html`.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'dist-artifact/index.html';
const OUT = 'dist-artifact/my-ikame.html';
const html = readFileSync(SRC, 'utf8');

/** Lấy mọi khối <tag ...>...</tag> ở cấp tài liệu; nội dung JS đã được plugin escape `</script>`. */
function blocks(tag) {
  const found = [];
  const open = new RegExp(`<${tag}\\b[^>]*>`, 'g');
  let match;
  while ((match = open.exec(html))) {
    const end = html.indexOf(`</${tag}>`, match.index);
    if (end === -1) break;
    found.push(html.slice(match.index, end + tag.length + 3));
    open.lastIndex = end;
  }
  return found;
}

const styles = blocks('style');
const scripts = blocks('script');
if (styles.length === 0 || scripts.length === 0) {
  throw new Error(`Thiếu style (${styles.length}) hoặc script (${scripts.length}) trong ${SRC}`);
}
if (/<link[^>]+rel="stylesheet"|<script[^>]+src=/.test(html)) {
  throw new Error('Còn file ngoài chưa được gộp — artifact sẽ chặn');
}

const page = [
  '<title>My iKame</title>',
  // Khung artifact ghim color-scheme sáng; app tự đổi theme qua data-theme trên .app-shell.
  ...styles,
  '<div id="root"></div>',
  ...scripts,
].join('\n');

writeFileSync(OUT, page);
console.log(`${OUT}: ${(page.length / 1024).toFixed(0)} KB (${styles.length} style, ${scripts.length} script)`);

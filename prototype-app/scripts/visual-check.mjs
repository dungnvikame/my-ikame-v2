import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import chromiumBinary from '@sparticuz/chromium';
import { chromium, expect } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, '../../deployments/visual-check');
const appRoot = path.resolve(here, '..');
const baseUrl = 'http://127.0.0.1:4173';
await fs.mkdir(output, { recursive: true });

const vite = spawn(process.execPath, [path.join(appRoot, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '4173'], {
  cwd: appRoot,
  stdio: 'ignore',
});

for (let attempt = 0; attempt < 30; attempt += 1) {
  try {
    const response = await fetch(baseUrl);
    if (response.ok) break;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

const browser = await chromium.launch({
  executablePath: await chromiumBinary.executablePath(),
  args: chromiumBinary.args,
  headless: true,
});

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await desktop.goto(baseUrl, { waitUntil: 'networkidle' });
  await desktop.screenshot({ path: path.join(output, 'ikamer-home-desktop.png'), fullPage: true });

  await desktop.getByRole('button', { name: 'Manager' }).click();
  await desktop.waitForURL('**/manager');
  await desktop.screenshot({ path: path.join(output, 'manager-overview-desktop.png'), fullPage: true });

  await desktop.goto(`${baseUrl}/news/security-update`, { waitUntil: 'networkidle' });
  await desktop.screenshot({ path: path.join(output, 'mandatory-article-desktop.png'), fullPage: true });
  await desktop.getByRole('button', { name: 'Xác nhận đã đọc' }).click();
  await expect(desktop.getByRole('heading', { name: 'Đã xác nhận' })).toBeVisible();

  await desktop.goto(`${baseUrl}/events/ai-product-workshop`, { waitUntil: 'networkidle' });
  await desktop.getByRole('button', { name: 'Đăng ký tham gia' }).click();
  await expect(desktop.getByRole('heading', { name: 'Bạn sẽ tham gia' })).toBeVisible();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto(baseUrl, { waitUntil: 'networkidle' });
  const mobileWidths = await mobile.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  if (mobileWidths.page > mobileWidths.viewport) throw new Error(`Mobile horizontal overflow: ${mobileWidths.page} > ${mobileWidths.viewport}`);
  await mobile.screenshot({ path: path.join(output, 'ikamer-home-mobile.png'), fullPage: true });
} finally {
  await browser.close();
  vite.kill('SIGTERM');
}

console.log(output);

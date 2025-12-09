import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function generateOgImage() {
  const svgPath = join(import.meta.dir, '../public/og-image.svg');
  const outputPath = join(import.meta.dir, '../public/og-image.png');

  const svgContent = readFileSync(svgPath, 'utf-8');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(html);

  const screenshot = await page.screenshot({ type: 'png' });
  writeFileSync(outputPath, screenshot);

  await browser.close();

  console.log('OG image generated:', outputPath);
}

generateOgImage();

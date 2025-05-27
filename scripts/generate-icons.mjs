import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(__dirname, '../public/logo.jpg');

async function generateIcons() {
  try {
    // Generate favicons in PNG format
    await sharp(sourcePath)
      .resize(32, 32, { fit: 'contain', background: { r: 26, g: 26, b: 36, alpha: 1 } })
      .png()
      .toFile(path.join(__dirname, '../public/favicon-32x32.png'));

    await sharp(sourcePath)
      .resize(16, 16, { fit: 'contain', background: { r: 26, g: 26, b: 36, alpha: 1 } })
      .png()
      .toFile(path.join(__dirname, '../public/favicon-16x16.png'));

    // Generate Apple Touch Icon
    await sharp(sourcePath)
      .resize(180, 180, { fit: 'contain', background: { r: 26, g: 26, b: 36, alpha: 1 } })
      .png()
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));

    // Generate other sizes for PWA
    const pwaSizes = [192, 512];
    for (const size of pwaSizes) {
      await sharp(sourcePath)
        .resize(size, size, { fit: 'contain', background: { r: 26, g: 26, b: 36, alpha: 1 } })
        .png()
        .toFile(path.join(__dirname, `../public/icon-${size}x${size}.png`));
    }

    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();

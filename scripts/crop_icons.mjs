import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const inputPath = 'C:/Users/A/.gemini/antigravity-ide/brain/c20aa8f1-58ab-4502-8282-6b7ebf3d641a/.user_uploaded/media_1790389098803.png';
const outputDir = path.join(process.cwd(), 'public/images/section2');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function cropIcons() {
  const metadata = await sharp(inputPath).metadata();
  console.log('Image size:', metadata.width, metadata.height);

  const width = metadata.width;
  const height = metadata.height;

  // Reference image has 3 cards:
  // Card 1 icon: left region around 3% to 32%
  // Card 2 icon: left region around 36% to 65%
  // Card 3 icon: left region around 69% to 98%

  // Let's crop icon 1 (Blue squircle)
  // In the image, top padding is around 10-15%, icon height is around 70-80% of height
  // Let's define bounding boxes relative to image size:
  
  // Icon 1:
  await sharp(inputPath)
    .extract({
      left: Math.round(width * 0.035),
      top: Math.round(height * 0.12),
      width: Math.round(width * 0.125),
      height: Math.round(height * 0.75)
    })
    .toFile(path.join(outputDir, 'card1_exact.png'));

  // Icon 2:
  await sharp(inputPath)
    .extract({
      left: Math.round(width * 0.365),
      top: Math.round(height * 0.12),
      width: Math.round(width * 0.125),
      height: Math.round(height * 0.75)
    })
    .toFile(path.join(outputDir, 'card2_exact.png'));

  // Icon 3:
  await sharp(inputPath)
    .extract({
      left: Math.round(width * 0.705),
      top: Math.round(height * 0.12),
      width: Math.round(width * 0.125),
      height: Math.round(height * 0.75)
    })
    .toFile(path.join(outputDir, 'card3_exact.png'));

  console.log('Successfully cropped 3 icons!');
}

cropIcons().catch(console.error);

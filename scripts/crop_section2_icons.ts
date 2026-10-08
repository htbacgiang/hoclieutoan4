import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

async function extractSection2Icons() {
  const fullPage = 'C:/Users/A/.gemini/antigravity-ide/brain/c20aa8f1-58ab-4502-8282-6b7ebf3d641a/.user_uploaded/media_1790354572371.jpg';
  const outDir = 'public/images/section2';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Math block squircle icon (left card)
  await sharp(fullPage)
    .extract({ left: 45, top: 225, width: 108, height: 108 })
    .png()
    .toFile(path.join(outDir, 'card1_icon.png'));

  // 2. Triangle ruler squircle icon (middle card)
  await sharp(fullPage)
    .extract({ left: 375, top: 225, width: 108, height: 108 })
    .png()
    .toFile(path.join(outDir, 'card2_icon.png'));

  // 3. Bar chart columns squircle icon (right card)
  await sharp(fullPage)
    .extract({ left: 702, top: 225, width: 108, height: 108 })
    .png()
    .toFile(path.join(outDir, 'card3_icon.png'));

  console.log('Successfully cropped all 3 Section 2 icons!');
}

extractSection2Icons().catch(console.error);

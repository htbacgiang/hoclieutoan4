import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

async function extract() {
  const src = 'public/images/hero-banner.png';
  const outDir = 'public/images/hero-parts';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Boy character: left: 0, top: 40, width: 235, height: 226
  await sharp(src)
    .extract({ left: 0, top: 40, width: 235, height: 226 })
    .toFile(path.join(outDir, 'boy_raw.png'));

  // 2. Lightbulb: left: 175, top: 15, width: 68, height: 85
  await sharp(src)
    .extract({ left: 175, top: 15, width: 68, height: 85 })
    .toFile(path.join(outDir, 'lightbulb_raw.png'));

  // 3. Formula: left: 215, top: 88, width: 85, height: 58
  await sharp(src)
    .extract({ left: 215, top: 88, width: 85, height: 58 })
    .toFile(path.join(outDir, 'formula_raw.png'));

  // 4. Triangle: left: 665, top: 15, width: 75, height: 75
  await sharp(src)
    .extract({ left: 665, top: 15, width: 75, height: 75 })
    .toFile(path.join(outDir, 'triangle_raw.png'));

  // 5. Bar chart: left: 760, top: 25, width: 55, height: 70
  await sharp(src)
    .extract({ left: 760, top: 25, width: 55, height: 70 })
    .toFile(path.join(outDir, 'barchart_raw.png'));

  // 6. Robot: left: 665, top: 85, width: 125, height: 160
  await sharp(src)
    .extract({ left: 665, top: 85, width: 125, height: 160 })
    .toFile(path.join(outDir, 'robot_raw.png'));

  // 7. Girl: left: 745, top: 90, width: 165, height: 176
  await sharp(src)
    .extract({ left: 745, top: 90, width: 165, height: 176 })
    .toFile(path.join(outDir, 'girl_raw.png'));

  // 8. Note: left: 865, top: 40, width: 135, height: 160
  await sharp(src)
    .extract({ left: 865, top: 40, width: 135, height: 160 })
    .toFile(path.join(outDir, 'note_raw.png'));

  console.log('Raw regions extracted successfully.');
}

extract().catch(console.error);

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/A/.gemini/antigravity-ide/brain/c20aa8f1-58ab-4502-8282-6b7ebf3d641a';
const OUT_DIR = 'public/images/hero-parts';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Flood fill from edges to remove pure white outer background
async function removeOuterWhite(inputPath: string, outputPath: string, threshold = 242) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width!;
  const height = metadata.height!;

  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const isWhite = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return r >= threshold && g >= threshold && b >= threshold;
  };

  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  // Seed boundary pixels
  for (let x = 0; x < width; x++) {
    if (isWhite(x, 0)) {
      visited[0 * width + x] = 1;
      queue.push(x, 0);
    }
    if (isWhite(x, height - 1)) {
      visited[(height - 1) * width + x] = 1;
      queue.push(x, height - 1);
    }
  }
  for (let y = 0; y < height; y++) {
    if (isWhite(0, y) && !visited[y * width + 0]) {
      visited[y * width + 0] = 1;
      queue.push(0, y);
    }
    if (isWhite(width - 1, y) && !visited[y * width + (width - 1)]) {
      visited[y * width + (width - 1)] = 1;
      queue.push(width - 1, y);
    }
  }

  // BFS Flood Fill
  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos] && isWhite(nx, ny)) {
          visited[nPos] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Apply alpha = 0 to visited pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (visited[pos]) {
        const idx = pos * channels;
        data[idx + 3] = 0; // Transparent
      }
    }
  }

  // Trim transparent edges and save as PNG
  await sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .trim()
    .png()
    .toFile(outputPath);

  console.log(`Saved transparent image: ${outputPath}`);
}

async function processAll() {
  // Copy scenic background
  const bgSrc = path.join(ARTIFACT_DIR, 'scenic_hills_sky_1790379007903.jpg');
  await sharp(bgSrc)
    .resize(1920, 720, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toFile('public/images/hero-bg.jpg');
  console.log('Saved public/images/hero-bg.jpg');

  // Process Boy
  await removeOuterWhite(
    path.join(ARTIFACT_DIR, 'boy_character_1790378913630.jpg'),
    path.join(OUT_DIR, 'boy.png')
  );

  // Process Robot
  await removeOuterWhite(
    path.join(ARTIFACT_DIR, 'robot_character_1790378929294.jpg'),
    path.join(OUT_DIR, 'robot.png')
  );

  // Process Girl
  await removeOuterWhite(
    path.join(ARTIFACT_DIR, 'girl_character_1790378945373.jpg'),
    path.join(OUT_DIR, 'girl.png')
  );

  // Process Note Paper
  await removeOuterWhite(
    path.join(ARTIFACT_DIR, 'hero_note_paper_1790378962730.jpg'),
    path.join(OUT_DIR, 'note.png'),
    240
  );

  // Process Math Elements: crop each element from math_elements_1790378983314.jpg
  const mathSrc = path.join(ARTIFACT_DIR, 'math_elements_1790378983314.jpg');
  const mathMeta = await sharp(mathSrc).metadata();
  const mW = mathMeta.width!;
  const mH = mathMeta.height!;

  // 1. Lightbulb (top-left quadrant)
  const bulbCrop = path.join(OUT_DIR, 'temp_bulb.png');
  await sharp(mathSrc)
    .extract({ left: 0, top: 0, width: Math.floor(mW * 0.5), height: Math.floor(mH * 0.5) })
    .toFile(bulbCrop);
  await removeOuterWhite(bulbCrop, path.join(OUT_DIR, 'lightbulb.png'));
  fs.unlinkSync(bulbCrop);

  // 2. Triangle ruler (top-right quadrant)
  const triangleCrop = path.join(OUT_DIR, 'temp_triangle.png');
  await sharp(mathSrc)
    .extract({ left: Math.floor(mW * 0.5), top: 0, width: Math.floor(mW * 0.5), height: Math.floor(mH * 0.5) })
    .toFile(triangleCrop);
  await removeOuterWhite(triangleCrop, path.join(OUT_DIR, 'triangle.png'));
  fs.unlinkSync(triangleCrop);

  // 3. Bar chart (bottom-left quadrant)
  const chartCrop = path.join(OUT_DIR, 'temp_chart.png');
  await sharp(mathSrc)
    .extract({ left: 0, top: Math.floor(mH * 0.5), width: Math.floor(mW * 0.5), height: Math.floor(mH * 0.5) })
    .toFile(chartCrop);
  await removeOuterWhite(chartCrop, path.join(OUT_DIR, 'barchart.png'));
  fs.unlinkSync(chartCrop);

  // 4. Formula card (bottom-right quadrant)
  const formulaCrop = path.join(OUT_DIR, 'temp_formula.png');
  await sharp(mathSrc)
    .extract({ left: Math.floor(mW * 0.5), top: Math.floor(mH * 0.5), width: Math.floor(mW * 0.5), height: Math.floor(mH * 0.5) })
    .toFile(formulaCrop);
  await removeOuterWhite(formulaCrop, path.join(OUT_DIR, 'formula.png'));
  fs.unlinkSync(formulaCrop);

  console.log('All elements processed and extracted successfully!');
}

processAll().catch(console.error);

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/A/.gemini/antigravity-ide/brain/c20aa8f1-58ab-4502-8282-6b7ebf3d641a';
const OUT_DIR = 'public/images/section2';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function removeWhiteBackground(inputPath: string, outputPath: string, cropYRatio = 1.0) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  let width = metadata.width!;
  let height = Math.floor(metadata.height! * cropYRatio);

  const { data, info } = await image
    .extract({ left: 0, top: 0, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const threshold = 245;

  const isWhite = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * channels;
    return data[idx] >= threshold && data[idx + 1] >= threshold && data[idx + 2] >= threshold;
  };

  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  for (let x = 0; x < width; x++) {
    if (isWhite(x, 0)) { visited[0 * width + x] = 1; queue.push(x, 0); }
    if (isWhite(x, height - 1)) { visited[(height - 1) * width + x] = 1; queue.push(x, height - 1); }
  }
  for (let y = 0; y < height; y++) {
    if (isWhite(0, y) && !visited[y * width + 0]) { visited[y * width + 0] = 1; queue.push(0, y); }
    if (isWhite(width - 1, y) && !visited[y * width + (width - 1)]) { visited[y * width + (width - 1)] = 1; queue.push(width - 1, y); }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
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

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (visited[pos]) {
        data[pos * channels + 3] = 0;
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .trim()
    .png()
    .toFile(outputPath);

  console.log(`Saved hand-drawn icon: ${outputPath}`);
}

async function run() {
  await removeWhiteBackground(
    path.join(ARTIFACT_DIR, 'handdrawn_card1_icon_1790388793231.jpg'),
    path.join(OUT_DIR, 'handdrawn1.png')
  );

  await removeWhiteBackground(
    path.join(ARTIFACT_DIR, 'handdrawn_card2_icon_1790388819257.jpg'),
    path.join(OUT_DIR, 'handdrawn2.png')
  );

  await removeWhiteBackground(
    path.join(ARTIFACT_DIR, 'handdrawn_card3_icon_1790388847153.jpg'),
    path.join(OUT_DIR, 'handdrawn3.png'),
    0.70 // crop bottom text
  );

  console.log('All hand-drawn icons processed!');
}

run().catch(console.error);

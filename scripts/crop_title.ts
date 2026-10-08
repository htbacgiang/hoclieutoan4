import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

async function extractTitle() {
  const src = 'public/images/hero-banner.png';
  const outPath = 'public/images/hero-parts/title-graphic.png';

  // Extract title region: left: 260, top: 10, width: 495, height: 165
  const cropped = await sharp(src)
    .extract({ left: 260, top: 10, width: 495, height: 165 })
    .toBuffer();

  const image = sharp(cropped);
  const metadata = await image.metadata();
  const width = metadata.width!;
  const height = metadata.height!;

  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;

  // Background in hero-banner around title is sky blue (r ~ 160..220, g ~ 210..245, b ~ 255)
  // We can remove sky background pixels that match sky blue or outer boundary
  const isSky = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Sky blue color test
    return (b > 230 && r > 150 && g > 195) || (r > 240 && g > 240 && b > 240);
  };

  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  for (let x = 0; x < width; x++) {
    if (isSky(x, 0)) { visited[0 * width + x] = 1; queue.push(x, 0); }
    if (isSky(x, height - 1)) { visited[(height - 1) * width + x] = 1; queue.push(x, height - 1); }
  }
  for (let y = 0; y < height; y++) {
    if (isSky(0, y) && !visited[y * width + 0]) { visited[y * width + 0] = 1; queue.push(0, y); }
    if (isSky(width - 1, y) && !visited[y * width + (width - 1)]) { visited[y * width + (width - 1)] = 1; queue.push(width - 1, y); }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos] && isSky(nx, ny)) {
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
    .toFile(outPath);

  console.log('Title graphic extracted to:', outPath);
}

extractTitle().catch(console.error);

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

export interface DocumentResult {
  fileName: string;
  filePath: string;
  content: string;
}

/**
 * Extracts plain text from PPTX files by parsing slide XML contents.
 */
export function extractPptxText(filePath: string): string {
  try {
    const buf = fs.readFileSync(filePath);
    let pos = 0;
    const slidesList: { slideNum: number; text: string }[] = [];

    while (pos < buf.length - 4) {
      if (buf.readUInt32LE(pos) === 0x04034b50) { // PK Zip local file header signature
        const compMethod = buf.readUInt16LE(pos + 8);
        const compSize = buf.readUInt32LE(pos + 18);
        const fileNameLen = buf.readUInt16LE(pos + 26);
        const extraLen = buf.readUInt16LE(pos + 28);
        const fileName = buf.toString('utf8', pos + 30, pos + 30 + fileNameLen);
        const dataStart = pos + 30 + fileNameLen + extraLen;

        const match = fileName.match(/^ppt\/slides\/slide(\d+)\.xml$/i);
        if (match) {
          const slideNum = parseInt(match[1], 10);
          const compressedData = buf.subarray(dataStart, dataStart + compSize);
          let xml = '';
          if (compMethod === 8) {
            try {
              xml = zlib.inflateRawSync(compressedData).toString('utf8');
            } catch (e) {
              // Ignore decompression error on damaged chunk
            }
          } else if (compMethod === 0) {
            xml = compressedData.toString('utf8');
          }

          const matches = Array.from(xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g))
            .map((m) => m[1].replace(/<[^>]+>/g, '').trim())
            .filter(Boolean);

          if (matches.length > 0) {
            slidesList.push({
              slideNum,
              text: `## Slide ${slideNum}\n\n` + matches.join('\n- '),
            });
          }
        }
        pos = dataStart + compSize;
      } else {
        pos++;
      }
    }

    // Sort slides numerically by slideNum (Slide 1, Slide 2, ..., Slide N)
    slidesList.sort((a, b) => a.slideNum - b.slideNum);

    return slidesList.map((s) => s.text).join('\n\n------------------------------------------------------------------------\n\n');
  } catch (err) {
    console.error('Error extracting text from PPTX file:', err);
    return '';
  }
}

/**
 * Extracts text from PDF files by parsing text streams and FlateDecode chunks.
 */
export function extractPdfText(filePath: string): string {
  try {
    const buf = fs.readFileSync(filePath);
    const textPieces: string[] = [];

    // Search for stream blocks inside PDF buffer
    let pos = 0;
    while (pos < buf.length) {
      const streamStart = buf.indexOf('stream', pos);
      if (streamStart === -1) break;

      const streamDataStart =
        streamStart + 6 + (buf[streamStart + 6] === 0x0d && buf[streamStart + 7] === 0x0a ? 2 : buf[streamStart + 6] === 0x0a ? 1 : 0);
      const streamEnd = buf.indexOf('endstream', streamDataStart);
      if (streamEnd === -1) break;

      const rawChunk = buf.subarray(streamDataStart, streamEnd);
      let decompressed = '';

      try {
        decompressed = zlib.inflateSync(rawChunk).toString('utf-8');
      } catch (e) {
        try {
          decompressed = zlib.inflateRawSync(rawChunk).toString('utf-8');
        } catch (e2) {
          decompressed = rawChunk.toString('utf-8');
        }
      }

      if (decompressed) {
        // Extract text inside Tj / TJ blocks or parenthesis (...)
        const matches = Array.from(decompressed.matchAll(/\(([^)]+)\)\s*Tj|\[((?:[^\]]+))\]\s*TJ/g));
        for (const match of matches) {
          const str = match[1] || match[2];
          if (str) {
            // Clean up octal escapes and pdf formatting
            const cleaned = str
              .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
              .replace(/\\([()])/g, '$1')
              .replace(/<[^>]+>/g, '')
              .trim();
            if (cleaned.length > 1 && !cleaned.startsWith('/') && !cleaned.startsWith('Font')) {
              textPieces.push(cleaned);
            }
          }
        }
      }

      pos = streamEnd + 9;
    }

    if (textPieces.length > 0) {
      return textPieces.join(' ').replace(/\s+/g, ' ');
    }

    return `Tài liệu PDF: ${path.basename(filePath)}`;
  } catch (err) {
    console.error('Error extracting text from PDF file:', err);
    return `Tài liệu PDF: ${path.basename(filePath)}`;
  }
}

/**
 * Normalizes text for fuzzy matching (lowercase, removes accents & symbols).
 */
function normalizeForMatching(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches `/public/tai-lieu/` directory for a document matching the lesson title, slug, or filename.
 */
export function getDocumentContentForLesson(
  lessonTitle?: string,
  lessonSlug?: string,
  explicitFileName?: string,
  options?: { truncateForAi?: boolean; maxChars?: number }
): DocumentResult | null {
  const dirPath = path.join(process.cwd(), 'public', 'tai-lieu');

  if (!fs.existsSync(dirPath)) {
    return null;
  }

  const files = fs.readdirSync(dirPath);
  if (files.length === 0) return null;

  let matchedFileName: string | null = null;

  // 1. Check explicit file name if provided
  if (explicitFileName) {
    const cleanExplicit = path.basename(explicitFileName);
    const found = files.find((f) => f.toLowerCase() === cleanExplicit.toLowerCase());
    if (found) matchedFileName = found;
  }

  // 2. Match by lesson title or slug (Prefer .md files over .pptx when both exist)
  if (!matchedFileName && (lessonTitle || lessonSlug)) {
    const normTitle = lessonTitle ? normalizeForMatching(lessonTitle) : '';
    const normSlug = lessonSlug ? normalizeForMatching(lessonSlug) : '';

    const matchingFiles = files.filter((f) => {
      const normF = normalizeForMatching(f);
      if (normTitle && (normF.includes(normTitle) || normTitle.includes(normF))) return true;
      if (normSlug && normF.includes(normSlug.replace(/-/g, ' '))) return true;
      return false;
    });

    if (matchingFiles.length > 0) {
      // Prefer .md files over .pptx
      matchedFileName = matchingFiles.find((f) => f.endsWith('.md')) || matchingFiles[0];
    }

    // Match lesson number (e.g. "Bài 1" or "Bài 2")
    if (!matchedFileName && (normTitle || normSlug)) {
      const matchNum = (normTitle || normSlug).match(/bai\s*(\d+)/i);
      if (matchNum) {
        const lessonNumStr = `bai ${matchNum[1]}`;
        const numMatches = files.filter((f) => normalizeForMatching(f).includes(lessonNumStr));
        if (numMatches.length > 0) {
          matchedFileName = numMatches.find((f) => f.endsWith('.md')) || numMatches[0];
        }
      }
    }
  }

  // Fallback to first available file if only 1 exists
  if (!matchedFileName && files.length === 1) {
    matchedFileName = files[0];
  }

  if (!matchedFileName) return null;

  const fullPath = path.join(dirPath, matchedFileName);
  let extractedText = '';

  const ext = path.extname(matchedFileName).toLowerCase();
  if (ext === '.pptx' || ext === '.ppt') {
    extractedText = extractPptxText(fullPath);
  } else if (ext === '.pdf') {
    extractedText = extractPdfText(fullPath);
  } else if (['.txt', '.md', '.json', '.html', '.csv'].includes(ext)) {
    try {
      extractedText = fs.readFileSync(fullPath, 'utf-8');
    } catch (e) {
      console.error('Error reading text file:', e);
    }
  } else {
    try {
      extractedText = fs.readFileSync(fullPath, 'utf-8');
    } catch (e) {
      extractedText = `Tài liệu đi kèm: ${matchedFileName}`;
    }
  }

  // Only truncate if explicitly requested for AI token limits
  if (options?.truncateForAi) {
    const limit = options.maxChars || 8000;
    if (extractedText.length > limit) {
      extractedText = extractedText.substring(0, limit) + '\n... [Nội dung tài liệu dài, đã trích xuất phần chính]';
    }
  }

  return {
    fileName: matchedFileName,
    filePath: `/tai-lieu/${matchedFileName}`,
    content: extractedText,
  };
}

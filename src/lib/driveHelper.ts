export interface ResolvedUrlInfo {
  type: 'GOOGLE_DRIVE_FOLDER' | 'GOOGLE_DRIVE_FILE' | 'DIRECT_FILE';
  embedUrl: string;
  directUrl: string;
  fileId?: string;
  folderId?: string;
  isEmbeddable: boolean;
}

/**
 * Resolves any input URL (especially Google Drive links) into clean embeddable preview URLs
 * and detects non-embeddable Google Drive Folders with user guidance.
 */
export function resolveDocumentUrl(rawUrl: string): ResolvedUrlInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      type: 'DIRECT_FILE',
      embedUrl: '',
      directUrl: '',
      isEmbeddable: false,
    };
  }

  let cleaned = rawUrl.trim();

  // Strip account index paths like /u/0/, /u/1/, /u/3/ from Google URLs
  cleaned = cleaned.replace(/\/u\/\d+\//g, '/');

  // 1. Check if it's a Google Drive Folder
  if (cleaned.includes('drive.google.com') && (cleaned.includes('/folders/') || cleaned.includes('folder'))) {
    const folderIdMatch = cleaned.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    const folderId = folderIdMatch ? folderIdMatch[1] : '';
    const cleanFolderUrl = folderId ? `https://drive.google.com/drive/folders/${folderId}` : cleaned;

    return {
      type: 'GOOGLE_DRIVE_FOLDER',
      embedUrl: cleanFolderUrl,
      directUrl: cleanFolderUrl,
      folderId,
      isEmbeddable: false, // Google Drive Folders block iframe embedding
    };
  }

  // 2. Check if it's a Google Drive / Docs / Sheets / Slides File
  if (cleaned.includes('drive.google.com') || cleaned.includes('docs.google.com')) {
    let fileId = '';
    const fileIdMatch = cleaned.match(/\/(?:file\/d|document\/d|spreadsheets\/d|presentation\/d)\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      fileId = fileIdMatch[1];
    } else {
      const queryIdMatch = cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (queryIdMatch && queryIdMatch[1]) {
        fileId = queryIdMatch[1];
      }
    }

    if (fileId) {
      return {
        type: 'GOOGLE_DRIVE_FILE',
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        directUrl: `https://drive.google.com/file/d/${fileId}/view`,
        fileId,
        isEmbeddable: true,
      };
    }
  }

  // 3. Standard direct URL (PDF, Word, etc.)
  return {
    type: 'DIRECT_FILE',
    embedUrl: cleaned,
    directUrl: cleaned,
    isEmbeddable: true,
  };
}

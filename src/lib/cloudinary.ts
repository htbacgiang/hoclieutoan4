import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'sample_secret_key',
  secure: true,
});

export interface MediaUploadResult {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  folder: string;
}

export async function uploadImage(
  fileBufferOrBase64: string | Buffer,
  folder = 'toan4/resources'
): Promise<MediaUploadResult> {
  try {
    const isMock = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === '1234567890';
    if (isMock) {
      const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return {
        publicId: `${folder}/${mockId}`,
        secureUrl: typeof fileBufferOrBase64 === 'string' && fileBufferOrBase64.startsWith('http')
          ? fileBufferOrBase64
          : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
        resourceType: 'image',
        format: 'jpg',
        width: 800,
        height: 600,
        bytes: 102400,
        folder,
      };
    }

    const str = typeof fileBufferOrBase64 === 'string'
      ? fileBufferOrBase64
      : `data:image/png;base64,${fileBufferOrBase64.toString('base64')}`;

    const res: UploadApiResponse = await cloudinary.uploader.upload(str, {
      folder,
      resource_type: 'image',
    });

    return {
      publicId: res.public_id,
      secureUrl: res.secure_url,
      resourceType: res.resource_type,
      format: res.format,
      width: res.width,
      height: res.height,
      bytes: res.bytes,
      folder,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Cloudinary Image Upload Error:', errorMessage);
    throw new Error(`Cloudinary upload failed: ${errorMessage}`);
  }
}

export async function uploadAvatar(
  fileBufferOrBase64: string | Buffer,
  folder = 'toan4/avatar'
): Promise<MediaUploadResult> {
  try {
    const isMock = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === '1234567890';
    if (isMock) {
      const mockId = `mock_avatar_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return {
        publicId: `${folder}/${mockId}`,
        secureUrl: typeof fileBufferOrBase64 === 'string' && fileBufferOrBase64.startsWith('http')
          ? fileBufferOrBase64
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        resourceType: 'image',
        format: 'jpg',
        width: 300,
        height: 300,
        bytes: 51200,
        folder,
      };
    }

    const str = typeof fileBufferOrBase64 === 'string'
      ? fileBufferOrBase64
      : `data:image/png;base64,${fileBufferOrBase64.toString('base64')}`;

    const res: UploadApiResponse = await cloudinary.uploader.upload(str, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'limit' }
      ],
    });

    return {
      publicId: res.public_id,
      secureUrl: res.secure_url,
      resourceType: res.resource_type,
      format: res.format,
      width: res.width,
      height: res.height,
      bytes: res.bytes,
      folder,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Cloudinary Avatar Upload Error:', errorMessage);
    throw new Error(`Cloudinary avatar upload failed: ${errorMessage}`);
  }
}

export async function uploadVideo(
  fileBufferOrBase64: string | Buffer,
  folder = 'toan4/videos'
): Promise<MediaUploadResult> {
  try {
    const isMock = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === '1234567890';
    if (isMock) {
      const mockId = `mock_vid_${Date.now()}`;
      return {
        publicId: `${folder}/${mockId}`,
        secureUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        resourceType: 'video',
        format: 'mp4',
        width: 1280,
        height: 720,
        duration: 120,
        bytes: 5242880,
        folder,
      };
    }

    const str = typeof fileBufferOrBase64 === 'string'
      ? fileBufferOrBase64
      : `data:video/mp4;base64,${fileBufferOrBase64.toString('base64')}`;

    const res: UploadApiResponse = await cloudinary.uploader.upload(str, {
      folder,
      resource_type: 'video',
    });

    return {
      publicId: res.public_id,
      secureUrl: res.secure_url,
      resourceType: res.resource_type,
      format: res.format,
      width: res.width,
      height: res.height,
      duration: res.duration,
      bytes: res.bytes,
      folder,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Cloudinary Video Upload Error:', errorMessage);
    throw new Error(`Cloudinary video upload failed: ${errorMessage}`);
  }
}

export async function uploadFile(
  fileBufferOrBase64: string | Buffer,
  folder = 'toan4/resources',
  resourceType: 'auto' | 'raw' | 'image' = 'auto'
): Promise<MediaUploadResult> {
  try {
    const isMock = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === '1234567890';
    if (isMock) {
      const mockId = `mock_doc_${Date.now()}`;
      return {
        publicId: `${folder}/${mockId}`,
        secureUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        resourceType: 'raw',
        format: 'pdf',
        bytes: 204800,
        folder,
      };
    }

    const str = typeof fileBufferOrBase64 === 'string'
      ? fileBufferOrBase64
      : `data:application/octet-stream;base64,${fileBufferOrBase64.toString('base64')}`;

    const res: UploadApiResponse = await cloudinary.uploader.upload(str, {
      folder,
      resource_type: resourceType,
    });

    return {
      publicId: res.public_id,
      secureUrl: res.secure_url,
      resourceType: res.resource_type,
      format: res.format,
      width: res.width,
      height: res.height,
      bytes: res.bytes,
      folder,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Cloudinary File Upload Error:', errorMessage);
    throw new Error(`Cloudinary file upload failed: ${errorMessage}`);
  }
}

export async function deleteMedia(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<boolean> {
  try {
    const isMock = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === '1234567890';
    if (isMock || publicId.startsWith('mock_') || publicId.includes('/mock_')) {
      return true;
    }
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return res.result === 'ok';
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Cloudinary Delete Error:', errorMessage);
    return false;
  }
}

export default cloudinary;

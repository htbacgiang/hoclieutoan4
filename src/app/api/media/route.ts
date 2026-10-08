import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Media from '@/models/Media';
import { uploadImage, uploadVideo, uploadFile, deleteMedia } from '@/lib/cloudinary';
import { getSession, canManageContent } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    const mediaList = await Media.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ media: mediaList });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi lấy danh sách media', error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền tải media lên' }, { status: 403 });
    }

    await connectToDatabase();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'toan4/resources';
    const resourceType = (formData.get('resourceType') as string) || 'image';

    if (!file) {
      return NextResponse.json({ message: 'Vui lòng chọn tệp để tải lên' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let uploadResult;
    if (resourceType === 'video') {
      uploadResult = await uploadVideo(buffer, folder);
    } else if (resourceType === 'raw' || file.type.includes('pdf')) {
      uploadResult = await uploadFile(buffer, folder, 'raw');
    } else {
      uploadResult = await uploadImage(buffer, folder);
    }

    const mediaDoc = await Media.create({
      filename: file.name,
      publicId: uploadResult.publicId,
      secureUrl: uploadResult.secureUrl,
      resourceType: uploadResult.resourceType,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      duration: uploadResult.duration,
      bytes: uploadResult.bytes || file.size,
      folder: uploadResult.folder,
      uploadedBy: session.id,
    });

    return NextResponse.json({ message: 'Tải media thành công', media: mediaDoc }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('API Media Upload error:', msg);
    return NextResponse.json({ message: 'Lỗi tải media lên Cloudinary', error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canManageContent(session.role)) {
      return NextResponse.json({ message: 'Bạn không có quyền xóa media' }, { status: 403 });
    }

    const { publicId, id } = await req.json();
    if (!publicId) {
      return NextResponse.json({ message: 'Thiếu publicId' }, { status: 400 });
    }

    await connectToDatabase();
    await deleteMedia(publicId);
    if (id) {
      await Media.findByIdAndDelete(id);
    } else {
      await Media.findOneAndDelete({ publicId });
    }

    return NextResponse.json({ message: 'Đã xóa file media thành công' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Lỗi xóa media', error: msg }, { status: 500 });
  }
}

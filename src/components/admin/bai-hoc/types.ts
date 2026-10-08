export interface ResourceMin {
  _id?: string;
  title: string;
  type: string;
  url: string;
}

export interface UserTeacherItem {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface LessonAdminItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  duration: number;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  rejectReason?: string;
  categoryId?: { name: string; _id: string };
  authorId?: { _id: string; name: string; email?: string; avatar?: string };
  objectives?: string[];
  resources?: ResourceMin[];
}

export interface CategoryOption {
  _id: string;
  name: string;
}

export interface LessonFormData {
  title: string;
  description: string;
  content: string;
  categoryId: string;
  authorId: string;
  duration: number;
  status: string;
  objectives: string;
  thumbnail?: string;
}

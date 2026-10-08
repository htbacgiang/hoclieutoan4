'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Gamepad2,
  Copy,
  Check,
  X,
  Sparkles,
  PlayCircle,
  AlertTriangle,
  Loader2,
  LayoutGrid,
  List,
  Folder,
  Filter,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

interface WordwallExerciseItem {
  _id: string;
  title: string;
  wordwallId: string;
  embedUrl: string;
  resourceUrl: string;
  thumbnail: string;
  categoryId?: string;
  categoryName: string;
  difficulty: 'Cơ bản' | 'Vận dụng' | 'Thử thách';
  htmlSnippet?: string;
  createdAt?: string;
}

export default function AdminBaiTapPage() {
  // Initial default Wordwall items
  const defaultWordwallItems: WordwallExerciseItem[] = [
    {
      _id: 'ww-100-review',
      title: 'ÔN TẬP CÁC SỐ TRONG PHẠM VI 100',
      wordwallId: '119357920',
      embedUrl: 'https://wordwall.net/play/119357/920/967',
      resourceUrl: 'https://wordwall.net/play/119357/920/967',
      thumbnail: 'https://screens.cdn.wordwall.net/200/ca5661ff2abf407a87d043383924a5bd_1',
      categoryName: 'CHỦ ĐỀ 1. ÔN TẬP VÀ BỔ SUNG',
      difficulty: 'Cơ bản',
      htmlSnippet:
        '<a target="_blank" href="https://wordwall.net/play/119357/920/967?ref=embed-image"><img src="https://screens.cdn.wordwall.net/200/ca5661ff2abf407a87d043383924a5bd_1" width="200" height="150" style="border:1px solid grey;display:block" /><span>ÔN TẬP CÁC SỐ TRONG PHẠM VI 100</span></a>',
    },
    {
      _id: 'ww-100-compare',
      title: 'So sánh các số trong phạm vi 100',
      wordwallId: '119358254',
      embedUrl: 'https://wordwall.net/play/119358/254',
      resourceUrl: 'https://wordwall.net/play/119358/254',
      thumbnail: 'https://screens.cdn.wordwall.net/200/8c23325df506410f8d9b59b657556104_1',
      categoryName: 'Chủ đề 1. ÔN TẬP VÀ BỔ SUNG',
      difficulty: 'Cơ bản',
      htmlSnippet:
        '<a target="_blank" href="https://wordwall.net/play/119358/254?ref=embed-image"><img src="https://screens.cdn.wordwall.net/200/8c23325df506410f8d9b59b657556104_1" width="200" height="150" style="border:1px solid grey;display:block" /><span>So sánh các số trong phạm vi 100</span></a>',
    },
  ];

  const [exercises, setExercises] = useState<WordwallExerciseItem[]>(defaultWordwallItems);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Active playing Wordwall game state
  const [activePlayingItem, setActivePlayingItem] = useState<WordwallExerciseItem | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const initialFormData = {
    title: '',
    snippet: '',
    categoryId: '',
    difficulty: 'Cơ bản' as 'Cơ bản' | 'Vận dụng' | 'Thử thách',
    thumbnail: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  // Strict helper to parse Wordwall ID, Embed URL, and Resource URL
  const extractWordwallIdAndEmbedUrl = (inputStr: string) => {
    if (!inputStr || !inputStr.includes('wordwall.net')) {
      return { wordwallId: '', embedUrl: '', resourceUrl: '' };
    }

    // 1. Check for 32-character hexadecimal GUID e.g. 9de203a339844bb6b8af198e9f68b759
    const guidMatch = inputStr.match(/([a-f0-9]{32})/i);
    if (guidMatch && guidMatch[1]) {
      const guid = guidMatch[1].toLowerCase();
      return {
        wordwallId: guid,
        embedUrl: `https://wordwall.net/embed/${guid}`,
        resourceUrl: `https://wordwall.net/resource/${guid}`,
      };
    }

    // 2. Check for resource URL e.g. wordwall.net/resource/119358254 or wordwall.net/vi/resource/119358254
    const resMatch = inputStr.match(/wordwall\.net\/(?:[a-z]{2}\/)?resource\/([0-9]{5,12})/i);
    if (resMatch && resMatch[1]) {
      const id = resMatch[1];
      return {
        wordwallId: id,
        embedUrl: `https://wordwall.net/embed/play/${id}`,
        resourceUrl: `https://wordwall.net/resource/${id}`,
      };
    }

    // 3. Check for play URL e.g. wordwall.net/play/119357/920/967 or wordwall.net/play/119358/254
    const playMatch = inputStr.match(/wordwall\.net\/(?:[a-z]{2}\/)?play\/([0-9\/\-]+)/i);
    if (playMatch && playMatch[1]) {
      const parts = playMatch[1].split('?')[0].split('#')[0].split('/').filter(Boolean);
      if (parts.length >= 2) {
        const id = parts[0] + parts[1];
        return {
          wordwallId: id,
          embedUrl: `https://wordwall.net/embed/play/${parts[0]}/${parts[1]}`,
          resourceUrl: `https://wordwall.net/resource/${id}`,
        };
      } else if (parts.length === 1 && parts[0].length >= 5) {
        const id = parts[0];
        return {
          wordwallId: id,
          embedUrl: `https://wordwall.net/embed/play/${id}`,
          resourceUrl: `https://wordwall.net/resource/${id}`,
        };
      }
    }

    // 4. Check for embed URL e.g. wordwall.net/embed/play/119357/920 or wordwall.net/embed/9de203a339844bb6b8af198e9f68b759
    const embedMatch = inputStr.match(/wordwall\.net\/embed\/(?:play\/)?([0-9\/\-]+)/i);
    if (embedMatch && embedMatch[1]) {
      const parts = embedMatch[1].split('?')[0].split('#')[0].split('/').filter(Boolean);
      const id = parts.length >= 2 ? parts[0] + parts[1] : parts[0];
      return {
        wordwallId: id,
        embedUrl: `https://wordwall.net/embed/play/${parts.join('/')}`,
        resourceUrl: `https://wordwall.net/resource/${id}`,
      };
    }

    // 5. Any explicit 5-12 digit sequence following wordwall.net/
    const genericMatch = inputStr.match(/wordwall\.net\/[^\s"'>]*?([0-9]{5,12})/i);
    if (genericMatch && genericMatch[1]) {
      const id = genericMatch[1];
      return {
        wordwallId: id,
        embedUrl: `https://wordwall.net/embed/play/${id}`,
        resourceUrl: `https://wordwall.net/resource/${id}`,
      };
    }

    return { wordwallId: '', embedUrl: '', resourceUrl: '' };
  };

  // Parser helper function for Wordwall HTML snippets or URLs
  const parseWordwallSnippet = (input: string) => {
    const str = (input || '').trim();

    if (!str) {
      return {
        wordwallId: '',
        embedUrl: '',
        resourceUrl: '',
        title: '',
        thumbnail: '',
      };
    }

    // 1. Title extraction
    const titleMatch =
      str.match(/<span>([^<]+)<\/span>/i) ||
      str.match(/title=["']([^"']+)["']/i) ||
      str.match(/alt=["']([^"']+)["']/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // 2. Thumbnail extraction
    const imgMatch =
      str.match(/<img[^>]*class=["'][^"']*js-thumbnail[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
      str.match(/src=["'](https?:\/\/[^"']*(?:screens\.cdn\.wordwall|wordwall)[^"']*)["']/i) ||
      str.match(/(https?:\/\/screens\.cdn\.wordwall\.net\/[^\s"'>]+)/i);

    let thumbnail = imgMatch ? imgMatch[1] : '';

    if (thumbnail && thumbnail.includes('screens.cdn.wordwall.net')) {
      thumbnail = thumbnail.replace(/\/screens\.cdn\.wordwall\.net\/[0-9]+\//i, '/screens.cdn.wordwall.net/800/');
    }

    // 3. Strict Wordwall ID and Embed URL extraction
    const { wordwallId, embedUrl, resourceUrl } = extractWordwallIdAndEmbedUrl(str);

    if (!thumbnail && wordwallId && wordwallId.length === 32) {
      thumbnail = `https://screens.cdn.wordwall.net/800/${wordwallId}_1`;
    }

    return {
      wordwallId,
      embedUrl,
      resourceUrl,
      title,
      thumbnail,
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      const catList: CategoryItem[] = catData.categories || [];
      setCategories(catList);

      // Load exercises
      const exRes = await fetch('/api/exercises');
      const exData = await exRes.json();
      const dbList: any[] = exData.exercises || [];

      const mappedList: WordwallExerciseItem[] = dbList.map((dbEx) => {
        const parsed = parseWordwallSnippet(dbEx.question || dbEx.content || '');
        const rawDbImage = (dbEx.image || '').trim();
        const isDbImageWordwallUrl =
          rawDbImage.includes('wordwall.net') && !rawDbImage.includes('screens.cdn.wordwall.net');
        const validThumbnail = isDbImageWordwallUrl
          ? parsed.thumbnail || ''
          : rawDbImage || parsed.thumbnail || '';

        return {
          _id: dbEx._id,
          title: dbEx.title || parsed.title,
          wordwallId: parsed.wordwallId,
          embedUrl: parsed.embedUrl,
          resourceUrl: parsed.resourceUrl,
          thumbnail: validThumbnail,
          categoryId: dbEx.categoryId?._id || dbEx.categoryId,
          categoryName: dbEx.categoryId?.name || 'CHỦ ĐỀ 1. ÔN TẬP VÀ BỔ SUNG',
          difficulty: dbEx.difficulty || 'Cơ bản',
          htmlSnippet: dbEx.question || dbEx.content,
          createdAt: dbEx.createdAt,
        };
      });
      setExercises(mappedList);

      // Auto-fetch missing thumbnails from Wordwall metadata API
      const itemsNeedingThumb = mappedList.filter(
        (item) => !item.thumbnail && (item.wordwallId || item.htmlSnippet || item.embedUrl)
      );
      if (itemsNeedingThumb.length > 0) {
        Promise.all(
          itemsNeedingThumb.map(async (item) => {
            try {
              const queryStr = item.htmlSnippet || item.embedUrl || item.wordwallId || item.resourceUrl;
              const res = await fetch(
                `/api/wordwall-meta?url=${encodeURIComponent(queryStr)}`
              );
              const data = await res.json();
              if (res.ok && data.thumbnail) {
                if (!item._id.startsWith('ww-')) {
                  fetch(`/api/exercises/${item._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: data.thumbnail }),
                  }).catch(() => {});
                }
                return { id: item._id, thumbnail: data.thumbnail };
              }
            } catch (e) {
              // ignore
            }
            return null;
          })
        ).then((results) => {
          const thumbMap: Record<string, string> = {};
          results.forEach((r) => {
            if (r && r.thumbnail) thumbMap[r.id] = r.thumbnail;
          });
          if (Object.keys(thumbMap).length > 0) {
            setExercises((prev) =>
              prev.map((ex) => (thumbMap[ex._id] ? { ...ex, thumbnail: thumbMap[ex._id] } : ex))
            );
          }
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setErrorMsg('');
    setFormData({
      title: '',
      snippet: '',
      categoryId: categories.length > 0 ? categories[0]._id : '',
      difficulty: 'Cơ bản',
      thumbnail: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: WordwallExerciseItem) => {
    setEditingId(item._id);
    setErrorMsg('');
    setFormData({
      title: item.title,
      snippet:
        item.htmlSnippet ||
        `<a target="_blank" href="${item.resourceUrl}"><img src="${item.thumbnail}" /><span>${item.title}</span></a>`,
      categoryId: item.categoryId || (categories.length > 0 ? categories[0]._id : ''),
      difficulty: item.difficulty,
      thumbnail: item.thumbnail || '',
    });
    setIsModalOpen(true);
  };

  const handleSnippetChange = async (snippetText: string) => {
    const parsed = parseWordwallSnippet(snippetText);
    let autoThumb = parsed.thumbnail || '';

    setFormData((prev) => ({
      ...prev,
      snippet: snippetText,
      title: parsed.title ? parsed.title : prev.title,
      thumbnail: autoThumb || prev.thumbnail,
    }));

    // If snippet text doesn't contain img tag but is a Wordwall link, fetch Wordwall auto-generated thumbnail
    if (!autoThumb && (snippetText.includes('wordwall.net') || parsed.wordwallId)) {
      try {
        const res = await fetch(`/api/wordwall-meta?url=${encodeURIComponent(snippetText)}`);
        const data = await res.json();
        if (res.ok && data.thumbnail) {
          setFormData((prev) => ({
            ...prev,
            title: prev.title || data.title || '',
            thumbnail: data.thumbnail,
          }));
        }
      } catch (err) {
        console.error('Lỗi tự động lấy thumbnail từ Wordwall:', err);
      }
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumb(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'toan4/exercise-thumbnails');

      const res = await fetch('/api/media', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải ảnh lên');

      const imgUrl = data.media?.secureUrl || data.secureUrl;
      setFormData((prev) => ({ ...prev, thumbnail: imgUrl }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Lỗi tải ảnh đại diện bài tập: ' + msg);
    } finally {
      setUploadingThumb(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.snippet || !formData.snippet.trim()) {
      setErrorMsg('Vui lòng dán mã nhúng HTML hoặc đường dẫn Wordwall.');
      return;
    }

    setSubmitting(true);

    const parsed = parseWordwallSnippet(formData.snippet);
    const finalTitle = formData.title.trim() || parsed.title || 'Bài tập Wordwall Toán 4';
    const targetCategoryId = formData.categoryId || (categories.length > 0 ? categories[0]._id : '');
    let rawThumb = formData.thumbnail.trim() || parsed.thumbnail || '';
    if (rawThumb.includes('wordwall.net') && !rawThumb.includes('screens.cdn.wordwall.net')) {
      rawThumb = parsed.thumbnail && !parsed.thumbnail.includes('wordwall.net/vi/embed') ? parsed.thumbnail : '';
    }
    let finalThumbnail = rawThumb;

    if (!finalThumbnail && (formData.snippet.includes('wordwall.net') || parsed.wordwallId)) {
      try {
        const metaRes = await fetch(`/api/wordwall-meta?url=${encodeURIComponent(formData.snippet.trim())}`);
        const metaData = await metaRes.json();
        if (metaRes.ok && metaData.thumbnail) {
          finalThumbnail = metaData.thumbnail;
        }
      } catch (e) {
        // ignore
      }
    }

    const payload = {
      title: finalTitle,
      question: formData.snippet.trim(),
      type: 'MATCHING',
      content: parsed.embedUrl || formData.snippet.trim(),
      image: finalThumbnail,
      options: parsed.wordwallId ? [parsed.wordwallId] : [],
      correctAnswer: 0,
      difficulty: formData.difficulty,
      categoryId: targetCategoryId,
    };

    try {
      if (editingId && !editingId.startsWith('ww-')) {
        const res = await fetch(`/api/exercises/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Lỗi khi cập nhật bài tập');
        }
      } else {
        const res = await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Lỗi khi tạo bài tập mới');
        }
      }

      await loadData();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteExercise = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleting(true);

    try {
      if (!id.startsWith('ww-')) {
        const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          alert(data.message || 'Lỗi khi xóa bài tập');
          return;
        }
      }
      setExercises((prev) => prev.filter((item) => item._id !== id));
      if (activePlayingItem?._id === id) {
        setActivePlayingItem(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setExercises((prev) => prev.filter((item) => item._id !== id));
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyIframe = (item: WordwallExerciseItem) => {
    const iframeCode = `<iframe src="${item.embedUrl}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(iframeCode);
    setCopiedId(item._id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filter exercises by search and selected category
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.title.toLowerCase().includes(search.toLowerCase()) ||
      ex.wordwallId.includes(search) ||
      ex.categoryName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' ||
      ex.categoryId === selectedCategory ||
      ex.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Unique list of category names present in exercises or categories
  const uniqueCategoryNames = Array.from(
    new Set([
      ...categories.map((c) => c.name),
      ...exercises.map((e) => e.categoryName),
    ].filter(Boolean))
  );

  // Group filtered exercises by categoryName
  const groupedExercises = filteredExercises.reduce((acc, ex) => {
    const cat = ex.categoryName || 'Chủ đề 1. ÔN TẬP VÀ BỔ SUNG';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(ex);
    return acc;
  }, {} as Record<string, WordwallExerciseItem[]>);

  const parsedFormPreview = parseWordwallSnippet(formData.snippet);

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-blue-600" />
            Quản Lý Bài Tập Nhúng Wordwall Tương Tác
          </h1>
          <p className="text-xs text-slate-500">
            Cho phép Thêm, Sửa, Xóa bài tập nhúng Wordwall phân loại theo chủ đề bài học và tùy chọn dạng xem Grid / List.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Nhúng Bài Tập Wordwall Mới
        </button>
      </div>

      {/* Active Wordwall Game Interactive Player Frame */}
      {activePlayingItem && (
        <div className="bg-slate-900 text-white rounded-3xl border-4 border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" /> LIVE WORDWALL GAME PLAYER
              </span>
              <h3 className="text-base font-extrabold text-white truncate max-w-md">
                {activePlayingItem.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={activePlayingItem.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                Mở trên Wordwall.net <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setActivePlayingItem(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Student Name Quick Copy Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-bold min-w-0">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                Tên tự động truyền vào Wordwall: <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-300 font-black border border-slate-700">Bảo Nam (Học sinh Lớp 4A)</code>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('Bảo Nam (Học sinh Lớp 4A)');
                setCopiedId('name-copied');
                setTimeout(() => setCopiedId(null), 2000);
              }}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white font-extrabold rounded-lg border border-slate-600 flex items-center gap-1.5 transition text-xs"
            >
              {copiedId === 'name-copied' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'name-copied' ? 'Đã chép tên!' : 'Sao chép tên nhanh'}</span>
            </button>
          </div>

          {/* Wordwall Iframe Live Interactive Game Container */}
          <div className="relative rounded-2xl overflow-hidden aspect-video w-full max-h-[550px] bg-black border border-slate-800 shadow-2xl">
            <iframe
              src={`${activePlayingItem.embedUrl}?name=${encodeURIComponent('Bảo Nam (Học sinh Lớp 4A)')}&studentName=${encodeURIComponent('Bảo Nam (Học sinh Lớp 4A)')}&student=${encodeURIComponent('Bảo Nam (Học sinh Lớp 4A)')}&username=${encodeURIComponent('Bảo Nam (Học sinh Lớp 4A)')}&ref=embed`}
              className="w-full h-full border-0 min-h-[480px]"
              allowFullScreen
              title={activePlayingItem.title}
            />
          </div>
        </div>
      )}

      {/* Toolbar: Search, Topic Filter, and View Mode Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm bài tập Wordwall theo tên hoặc ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Topic Filter & View Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[220px] truncate"
            >
              <option value="ALL">Tất cả chủ đề ({exercises.length})</option>
              {uniqueCategoryNames.map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
                }`}
              title="Hiển thị dạng Grid (Lưới)"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
                }`}
              title="Hiển thị dạng List (Danh sách)"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wordwall Exercises Grouped by Topic Sections */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Đang tải danh sách bài tập nhúng Wordwall...
        </div>
      ) : Object.keys(groupedExercises).length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-200">
          Chưa tìm thấy bài tập Wordwall nào phù hợp với bộ lọc.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedExercises).map(([catName, items]) => (
            <div key={catName} className="space-y-4">
              {/* Category Topic Header */}
              <div className="flex items-center justify-between bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-white">{catName}</h2>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Danh sách bài tập tương tác thuộc chủ đề
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold text-xs">
                  {items.length} bài tập
                </span>
              </div>

              {/* Grid / Card Interactive Preview Mode */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-5 space-y-4"
                    >
                      {/* Top Header matching user screenshot */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                            <Gamepad2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-[#123B72] text-sm sm:text-base truncate">
                              {item.title.startsWith('Bài tập') ? item.title : `Bài tập ${item.title}`}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-[10px] uppercase">
                            {item.categoryName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {item.difficulty}
                          </span>
                          {item.wordwallId ? (
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 font-bold text-[10px]">
                              ID: {item.wordwallId}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Interactive Wordwall Iframe Preview Container matching user screenshot */}
                      <div className="w-full">
                        {item.embedUrl ? (
                          <div className="relative rounded-2xl overflow-hidden aspect-video w-full border-4 border-slate-900 shadow-xl bg-slate-950 min-h-[340px] sm:min-h-[420px]">
                            <iframe
                              src={`${item.embedUrl}?name=${encodeURIComponent('Học sinh Lớp 4')}&ref=embed`}
                              className="w-full h-full border-0 min-h-[340px] sm:min-h-[420px]"
                              allowFullScreen
                              title={item.title}
                            />
                          </div>
                        ) : (
                          <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-3 min-h-[260px] flex flex-col items-center justify-center">
                            <Gamepad2 className="w-10 h-10 text-slate-400 opacity-60 mx-auto" />
                            <div className="text-sm font-bold text-slate-700">Chưa gắn mã nhúng Wordwall cho bài tập này</div>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                              Nhấn nút bên dưới để dán mã nhúng <code>&lt;iframe&gt;</code> hoặc đường dẫn bài tập từ Wordwall.net.
                            </p>
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm transition"
                            >
                              <Edit className="w-3.5 h-3.5" /> Dán Mã Nhúng Wordwall
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {item.embedUrl ? (
                          <button
                            onClick={() => setActivePlayingItem(item)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                          >
                            <PlayCircle className="w-3.5 h-3.5" /> Chơi Trình Chiếu Toàn Màn Hình
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 italic">Chưa nhúng game</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          {item.embedUrl && (
                            <button
                              onClick={() => handleCopyIframe(item)}
                              className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold transition"
                              title="Sao chép mã nhúng Iframe"
                            >
                              {copiedId === item._id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-blue-600 rounded-xl text-xs transition"
                            title="Sửa bài tập Wordwall"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteTarget({ id: item._id, title: item.title })}
                            className="p-2 bg-slate-50 hover:bg-red-50 border border-slate-200 text-red-500 rounded-xl text-xs transition cursor-pointer"
                            title="Xóa bài tập Wordwall"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View Mode */
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group flex items-center justify-center">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400">
                              <Gamepad2 className="w-6 h-6 opacity-40" />
                            </div>
                          )}
                          {item.embedUrl && (
                            <button
                              onClick={() => setActivePlayingItem(item)}
                              className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                              title="Chơi thử"
                            >
                              <PlayCircle className="w-6 h-6 text-white drop-shadow-md" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-[10px] uppercase">
                              {item.categoryName}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                              {item.difficulty}
                            </span>
                            {item.wordwallId ? (
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-bold text-[10px]">
                                ID: {item.wordwallId}
                              </span>
                            ) : null}
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-sm truncate">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {item.embedUrl ? (
                          <button
                            onClick={() => setActivePlayingItem(item)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                          >
                            <PlayCircle className="w-3.5 h-3.5" /> Chơi thử
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                          >
                            <Edit className="w-3.5 h-3.5" /> Nhúng Wordwall
                          </button>
                        )}

                        <button
                          onClick={() => handleCopyIframe(item)}
                          className="p-2 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold"
                          title="Sao chép mã nhúng Iframe"
                        >
                          {copiedId === item._id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 bg-white hover:bg-blue-50 border border-slate-200 text-blue-600 rounded-xl text-xs"
                          title="Sửa bài tập Wordwall"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget({ id: item._id, title: item.title })}
                          className="p-2 bg-white hover:bg-red-50 border border-slate-200 text-red-500 rounded-xl text-xs cursor-pointer"
                          title="Xóa bài tập Wordwall"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Wordwall Embed Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-blue-600" />
                {editingId ? 'Chỉnh Sửa Bài Tập Wordwall' : 'Tạo Bài Tập Wordwall Mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* HTML Snippet / Link Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Dán Mã Nhúng HTML hoặc Đường dẫn Wordwall <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.snippet}
                  onChange={(e) => handleSnippetChange(e.target.value)}
                  placeholder={`Dán mã nhúng Wordwall dạng:\n<a target="_blank" href="https://wordwall.net/vi/resource/119358254/..."><img src="..."/><span>So sánh các số trong phạm vi 100</span></a>`}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-slate-50"
                />
                <p className="text-[11px] text-slate-500 italic">
                  💡 Mẹo: Dán trực tiếp đoạn mã nhúng từ nút "Embed" trên Wordwall.net, hệ thống sẽ tự động bóc tách tiêu đề, ID và ảnh đại diện!
                </p>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên bài tập Wordwall <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: So sánh các số trong phạm vi 100"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Thumbnail Image Section */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Ảnh đại diện bài tập (Thumbnail)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Dán đường dẫn link ảnh (VD: https://domain.com/image.jpg)..."
                        value={formData.thumbnail || ''}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <label className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-xs">
                        {uploadingThumb ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang tải...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Tải ảnh từ máy</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingThumb}
                          onChange={handleThumbnailUpload}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      ✨ Ảnh thumbnail được tự động nhận diện từ bài tập Wordwall. Bạn cũng có thể dán link ảnh khác hoặc tải ảnh riêng từ máy tính nếu muốn.
                    </p>
                  </div>

                  {/* Live Preview Box */}
                  <div className="flex items-center justify-center border border-slate-200 rounded-2xl bg-white p-2 h-24 relative overflow-hidden shadow-xs">
                    {formData.thumbnail ? (
                      <div className="relative w-full h-full rounded-xl overflow-hidden group">
                        <img
                          src={formData.thumbnail}
                          alt="Exercise thumbnail preview"
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, thumbnail: '' })}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-lg shadow-md transition"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40 text-blue-400" />
                        <span className="text-[10px] font-semibold text-slate-400">Chưa chọn ảnh đại diện</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category & Difficulty Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mạch kiến thức</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Chủ đề 1. ÔN TẬP VÀ BỔ SUNG">Chủ đề 1. ÔN TẬP VÀ BỔ SUNG</option>
                        <option value="Chủ đề 2. GÓC VÀ ĐƠN VỊ ĐO GÓC">Chủ đề 2. GÓC VÀ ĐƠN VỊ ĐO GÓC</option>
                        <option value="Chủ đề 3. SỐ CÓ NHIỀU CHỮ SỐ">Chủ đề 3. SỐ CÓ NHIỀU CHỮ SỐ</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Độ khó</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Thử thách">Thử thách</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Xem Trước Trực Tiếp Khung Nhúng Wordwall:
                </label>
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-black aspect-video w-full">
                  <iframe
                    src={`${parsedFormPreview.embedUrl}?ref=embed`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title="Wordwall Preview"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition"
                >
                  {submitting ? 'Đang lưu...' : editingId ? 'Cập Nhật Nhúng' : 'Lưu Bài Tập Wordwall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteExercise}
        title="Xóa bài tập Wordwall"
        itemName={deleteTarget?.title}
        description="Bạn có chắc chắn muốn xóa bài tập nhúng Wordwall này khỏi hệ thống?"
        isLoading={deleting}
      />
    </div>
  );
}

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const input = searchParams.get('url') || searchParams.get('id') || searchParams.get('iframe') || '';

    if (!input || !input.trim()) {
      return NextResponse.json({ message: 'Thiếu tham số url, id hoặc iframe' }, { status: 400 });
    }

    const str = input.trim();

    // 1. Extract direct URL if present (from iframe src or full URL string)
    const directUrlMatch = str.match(/src=["'](https?:\/\/[^"']+)["']/i) || str.match(/(https?:\/\/[^\s"'>]+)/i);
    const rawUrl = directUrlMatch ? directUrlMatch[1] : '';

    // 2. Extract Wordwall ID (32-char hex GUID or numeric ID)
    const guidMatch = str.match(/([a-f0-9]{32})/i);
    let wordwallId = guidMatch ? guidMatch[1].toLowerCase() : '';

    if (!wordwallId) {
      const resMatch = str.match(/resource\/([0-9]{5,12})/i);
      if (resMatch && resMatch[1]) {
        wordwallId = resMatch[1];
      } else {
        const playMatch = str.match(/play\/([0-9\/\-]+)/i);
        if (playMatch && playMatch[1]) {
          const parts = playMatch[1].split('?')[0].split('#')[0].split('/').filter(Boolean);
          wordwallId = parts.length >= 2 ? parts[0] + parts[1] : parts[0];
        } else {
          const genericNumMatch = str.match(/([0-9]{5,12})/);
          if (genericNumMatch) {
            wordwallId = genericNumMatch[1];
          }
        }
      }
    }

    if (!wordwallId && !rawUrl) {
      return NextResponse.json({ message: 'Không thể trích xuất ID hoặc URL bài tập Wordwall' }, { status: 400 });
    }

    // Determine target URLs to attempt fetching
    const urlsToTry: string[] = [];

    if (rawUrl && rawUrl.includes('wordwall.net')) {
      urlsToTry.push(rawUrl);
    }

    if (wordwallId) {
      if (wordwallId.length === 32) {
        urlsToTry.push(`https://wordwall.net/embed/${wordwallId}`);
        urlsToTry.push(`https://wordwall.net/vi/embed/${wordwallId}`);
      } else {
        urlsToTry.push(`https://wordwall.net/resource/${wordwallId}`);
        urlsToTry.push(`https://wordwall.net/vi/resource/${wordwallId}`);
      }
    }

    let title = '';
    let description = '';
    let thumbnail = '';

    for (const targetUrl of urlsToTry) {
      if (thumbnail && title && description) break;
      try {
        const fetchRes = await fetch(targetUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          next: { revalidate: 86400 },
        });

        if (fetchRes.ok) {
          const html = await fetchRes.text();

          // 1. Direct match for img tags with class="thumbnail" or js-thumbnail or screens.cdn.wordwall.net
          const imgTagMatch =
            html.match(/<img[^>]*class=["'][^"']*js-thumbnail[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
            html.match(/<img[^>]*src=["']([^"']*screens\.cdn\.wordwall\.net[^"']+)["']/i) ||
            html.match(/(https:\/\/screens\.cdn\.wordwall\.net\/[^\s"'\>\)]+)/i);

          if (imgTagMatch && imgTagMatch[1]) {
            thumbnail = imgTagMatch[1];
          }

          // 2. Parse og:image meta tag if not found
          if (!thumbnail) {
            const ogImageMatch =
              html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
              html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
              html.match(/<meta\s+name=["']thumbnail["']\s+content=["']([^"']+)["']/i) ||
              html.match(/"thumbnailUrl"\s*:\s*["']([^"']+)["']/i);

            if (ogImageMatch && ogImageMatch[1]) {
              thumbnail = ogImageMatch[1];
            }
          }

          // 3. Parse activityGuid if not found
          if (!thumbnail) {
            const pageGuidMatch = html.match(/"activityGuid"\s*:\s*["']([a-f0-9]{32})["']/i);
            if (pageGuidMatch && pageGuidMatch[1]) {
              thumbnail = `https://screens.cdn.wordwall.net/800/${pageGuidMatch[1]}_1`;
            }
          }

          // Parse title
          if (!title) {
            const ogTitleMatch =
              html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
              html.match(/<title>([^<]+)<\/title>/i);

            if (ogTitleMatch && ogTitleMatch[1]) {
              title = ogTitleMatch[1]
                .replace(/ - Wordwall.*$/i, '')
                .replace(/^&#\d+;\s*/, '')
                .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
                .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .trim();
            }
          }

          // Parse description
          if (!description) {
            const descMatch =
              html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
              html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

            if (descMatch && descMatch[1]) {
              description = descMatch[1].trim();
            }
          }
        }
      } catch (e) {
        // Continue to next URL if fetch fails
      }
    }

    // Standardize high quality 800px CDN thumbnail URL
    if (thumbnail && thumbnail.includes('screens.cdn.wordwall.net')) {
      thumbnail = thumbnail.replace(/\/screens\.cdn\.wordwall\.net\/[0-9]+\//i, '/screens.cdn.wordwall.net/800/');
    }

    // Direct fallback for 32-char GUIDs if scraping didn't find one
    if (!thumbnail && wordwallId && wordwallId.length === 32) {
      thumbnail = `https://screens.cdn.wordwall.net/800/${wordwallId}_1`;
    }

    const targetEmbedUrl = wordwallId
      ? wordwallId.length === 32
        ? `https://wordwall.net/embed/${wordwallId}`
        : rawUrl.includes('/embed/') ? rawUrl : `https://wordwall.net/resource/${wordwallId}`
      : rawUrl;

    const targetResourceUrl = wordwallId
      ? `https://wordwall.net/resource/${wordwallId}`
      : rawUrl;

    const embedIframeCode = `<iframe src="${targetEmbedUrl}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`;

    return NextResponse.json({
      wordwallId: wordwallId || '',
      title: title || 'Bài tập Wordwall Toán 4',
      description: description || '',
      thumbnail: thumbnail || '',
      resourceUrl: targetResourceUrl,
      embedUrl: targetEmbedUrl,
      iframeCode: embedIframeCode,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: 'Internal Server Error', error: msg }, { status: 500 });
  }
}


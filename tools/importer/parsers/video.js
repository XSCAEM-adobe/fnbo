/* eslint-disable */
/* global WebImporter */
/**
 * Parser for video. Base: video.
 * Source: https://www.fnbo.com/personal-banking/savings
 *   (video-embeds-3up — row of 3 YouTube video embeds)
 * Convention (Video): 1 column. Row 1 = block name. Subsequent row(s) contain
 *   the video source (link/streaming URL); the block decorates it into a
 *   player. Here the 3-up group is emitted as one video block with one row per
 *   video URL (the 3-up arrangement is a layout/section concern).
 *
 * Source videos are YouTube embeds. Extract each video's URL from an <iframe
 * src>, an anchor href, or a data attribute, normalise it to a watchable
 * youtube.com/watch URL, and emit one 1-cell row per video containing a link.
 */
export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();

  const toYouTubeUrl = (raw) => {
    if (!raw) return null;
    const url = raw.trim();
    // youtu.be/ID or /embed/ID or /v/ID or /shorts/ID -> watch?v=ID
    let m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed|v|shorts)\/)([\w-]{6,})/);
    if (m) return `https://www.youtube.com/watch?v=${m[1]}`;
    m = url.match(/[?&]v=([\w-]{6,})/);
    if (m) return `https://www.youtube.com/watch?v=${m[1]}`;
    if (/youtube\.com|youtu\.be/.test(url)) return url;
    return url; // non-YouTube: pass through
  };

  const addVideo = (raw) => {
    const url = toYouTubeUrl(raw);
    if (!url || seen.has(url)) return;
    seen.add(url);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.textContent = url;
    cells.push([a]);
  };

  // 1) iframes (YouTube players)
  element.querySelectorAll('iframe[src]').forEach((f) => {
    const src = f.getAttribute('src') || '';
    if (/youtube|youtu\.be/.test(src)) addVideo(src);
  });

  // 2) anchors / data attributes referencing YouTube
  if (!cells.length) {
    element.querySelectorAll('a[href], [data-video], [data-src], [data-video-id], [data-embed]')
      .forEach((el) => {
        const raw = el.getAttribute('href')
          || el.getAttribute('data-video')
          || el.getAttribute('data-src')
          || el.getAttribute('data-embed')
          || (el.getAttribute('data-video-id')
            ? `https://www.youtube.com/watch?v=${el.getAttribute('data-video-id')}`
            : '');
        if (raw && /youtube|youtu\.be/.test(raw)) addVideo(raw);
      });
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'video', cells });
  element.replaceWith(block);
}

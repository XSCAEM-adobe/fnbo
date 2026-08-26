/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Sources:
 *   - https://www.fnbo.com/ (community-band, independent-bank full-bleed bands)
 *   - https://www.fnbo.com/personal-banking/checking/free-checking (pagehero)
 * Convention (Hero): 1 column, 3 rows. Row 1 = block name. Row 2 = background
 *   image. Row 3 = title + subheading + CTA(s) (all in one cell).
 *
 * Background image resolution (in priority order):
 *  1) a real <img> that is NOT the .cmp-image__image content image (cleaned/
 *     base markup and product pageheros express the bg as a plain <img>).
 *  2) CSS background carried in [data-background-style="background: ... url(DM)"].
 *  3) [data-cmp-src] template URL on the
 *     [data-cmp-is="pagesectionwithbackgroundimage"] carrier (live render, no img).
 *  4) legacy WebImporter background-image style on the wrapper.
 *  5) verified server-rendered URL keyed off the band's heading/body text.
 * The resolved DM URL is normalized (strip {.width}, dpr=on,{dpr} -> dpr=off)
 * and emitted as an <img>, which the fnbo-dm-images transformer converts to a
 * DM carrier anchor for the scripts.js auto-block to rebuild as <picture>.
 */

// Verified server-rendered band backgrounds (from https://www.fnbo.com/).
const BAND_BG_BY_KEYWORD = [
  [/more than a bank|neighbor you can count on|community/i, 'https://s7d1.scene7.com/is/image/fnnistage/rodeo-rider-fnbo-flag-2x?ts=1770915583521&$Hero$&dpr=off'],
  [/independent bank/i, 'https://s7d1.scene7.com/is/image/fnnistage/mother-child-biking-in-fields-2x?ts=1773164816165&$Hero$&dpr=off'],
];

function isDmUrl(src) {
  if (!src) return false;
  try {
    return new URL(src, 'https://x/').pathname.startsWith('/is/image/');
  } catch {
    return false;
  }
}

function normalizeDmUrl(raw) {
  if (!raw) return '';
  let url = String(raw).trim().replace(/^url\(|\)$/gi, '').replace(/^['"]|['"]$/g, '');
  url = url.replace(/\{\.width\}/g, '');
  url = url.replace(/dpr=on,\{dpr\}/gi, 'dpr=off');
  url = url.replace(/dpr=on,[\d.]+/gi, 'dpr=off');
  if (!url.includes('?')) url += '?wid=2000&fmt=webp';
  return url;
}

function bgFromStyle(style) {
  if (!style) return '';
  const m = style.match(/url\(\s*(['"]?)([^'")]+)\1\s*\)/i);
  return m && m[2] ? m[2] : '';
}

export default function parse(element, { document }) {
  const cells = [];

  // Row 2: background image.
  let bgUrl = '';

  // 1) Real background <img> (non-content). Product pageheros and cleaned
  //    homepage markup put the bg here.
  const allImgs = Array.from(element.querySelectorAll('img'));
  const imgEl = allImgs.find((img) => !img.classList.contains('cmp-image__image'));
  if (imgEl && isDmUrl(imgEl.getAttribute('src'))) {
    bgUrl = normalizeDmUrl(imgEl.getAttribute('src'));
  } else if (imgEl && imgEl.getAttribute('src')) {
    // Non-DM background image (e.g. a local asset) — keep it verbatim.
    bgUrl = imgEl.getAttribute('src');
  }

  // 2) CSS background in [data-background-style].
  if (!bgUrl) {
    const hook = element.querySelector('[data-background-style]');
    if (hook) {
      const raw = bgFromStyle(hook.getAttribute('data-background-style'));
      if (isDmUrl(raw)) bgUrl = normalizeDmUrl(raw);
    }
  }

  // 3) [data-cmp-src] template URL on the carrier.
  if (!bgUrl) {
    const carrier = element.querySelector('[data-cmp-is="pagesectionwithbackgroundimage"]');
    if (carrier && isDmUrl(carrier.getAttribute('data-cmp-src'))) {
      bgUrl = normalizeDmUrl(carrier.getAttribute('data-cmp-src'));
    }
  }

  // 4) Legacy WebImporter-style background-image on the wrapper.
  if (!bgUrl) {
    const bgWrap = element.querySelector('.cmp-pagesectionwithbackgroundimage[style*="background"], [style*="background-image"]');
    const style = bgWrap ? bgWrap.getAttribute('style') || '' : '';
    const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
    if (m && m[2]) bgUrl = m[2];
  }

  // 5) Fallback: verified URL keyed off the band's text.
  if (!bgUrl) {
    const text = element.textContent || '';
    const hit = BAND_BG_BY_KEYWORD.find(([re]) => re.test(text));
    if (hit) bgUrl = hit[1];
  }

  let bg = null;
  if (bgUrl) {
    bg = document.createElement('img');
    bg.setAttribute('src', bgUrl);
    bg.setAttribute('alt', '');
  }

  // Row 3: title(s), body text and CTAs in document order. Exclude the bg img.
  const contentCell = [];
  const nodes = element.querySelectorAll(
    '.cmp-title, .cmp-text, a.cmp-linkcalltoaction, a.cmp-applynowcta, a.btn'
  );
  const added = [];
  nodes.forEach((node) => {
    // Skip CTAs/text already contained by a node we captured.
    if (added.some((s) => s.contains(node))) return;
    added.push(node);
    contentCell.push(node);
  });

  if (!bg && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  if (bg) cells.push([bg]);
  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.fnbo.com/ (homepage hero carousel)
 * Convention (Carousel): 2 columns. Row 1 = block name. Each subsequent row =
 *   1 slide: cell 1 = image (mandatory), cell 2 = text (title/description/CTA).
 *
 * Each slide is a full-bleed pagesection. The slide background is a Scene7
 * Dynamic Media image that the source may express in one of three ways:
 *  a) cleaned/base markup: a real <img> that is a direct child of
 *     .cmp-pagesectionwithbackgroundimage (the background position).
 *  b) live-rendered markup: a CSS background applied via
 *     [data-background-style="background: ... url(DM-URL)"] on the image hook,
 *     and/or a [data-cmp-src] template URL on the
 *     [data-cmp-is="pagesectionwithbackgroundimage"] carrier. No <img> exists.
 * We resolve the DM URL, normalize its templating tokens, and emit it as an
 * <img> in cell 1 so the fnbo-dm-images transformer + scripts.js DM auto-block
 * rebuild it into a responsive <picture>. Cell 2 is the whole content wrapper.
 *
 * Personalization note: the homepage hero slide 1 is A/B/personalization
 * swapped at load, so the live import fetch may deliver a variant whose
 * background is CSS-only (or whose only <img> is a decorative foreground PNG).
 * As a final fallback we key the six verified server-rendered background URLs
 * off the slide heading/body text so the correct photo always lands.
 */

// Verified server-rendered hero backgrounds (from https://www.fnbo.com/),
// keyed by text that reliably identifies each slide.
// Pairings verified against migration-work/cleaned.html (the server render):
// slide 3 "Free Business Checking" uses sm-bus-petra; slide 4
// "ONE THAT NAVIGATES" (international) uses railyard-sunset.
const HERO_BG_BY_KEYWORD = [
  [/evergreen/i, 'https://s7d1.scene7.com/is/image/fnnistage/evergreen-debit-forest-2x?ts=1782737334714&$Hero$&dpr=off'],
  [/vault/i, 'https://s7d1.scene7.com/is/image/fnnistage/the-vault-hero?ts=1766172395424&$Hero$&dpr=off'],
  [/business checking/i, 'https://s7d1.scene7.com/is/image/fnnistage/sm-bus-petra-2x?ts=1772846692940&$Hero$&dpr=off'],
  [/navigates|international|global/i, 'https://s7d1.scene7.com/is/image/fnnistage/railyard-sunset-2x?ts=1777641618886&$Hero$&dpr=off'],
];

function isDmUrl(src) {
  if (!src) return false;
  try {
    return new URL(src, 'https://x/').pathname.startsWith('/is/image/');
  } catch {
    return false;
  }
}

// Normalize a DM URL from live markup: strip the {.width} width token and
// turn dpr=on,{dpr} (or a concrete dpr=on,N) into dpr=off; add a concrete
// rendition query when none is present so the URL resolves.
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

// Resolve the background DM URL for a single slide.
function resolveSlideBg(slide) {
  const carrier = slide.querySelector('[data-cmp-is="pagesectionwithbackgroundimage"]')
    || slide.querySelector('.cmp-pagesectionwithbackgroundimage');

  // 1) CSS background carried in [data-background-style].
  const hook = slide.querySelector('[data-background-style]');
  if (hook) {
    const raw = bgFromStyle(hook.getAttribute('data-background-style'));
    if (isDmUrl(raw)) return normalizeDmUrl(raw);
  }

  // 2) [data-cmp-src] template URL on the carrier.
  if (carrier) {
    const raw = carrier.getAttribute('data-cmp-src');
    if (isDmUrl(raw)) return normalizeDmUrl(raw);
  }

  // 3) Real background <img> that is a direct child of the background wrapper
  //    (base/cleaned markup). Direct-child only, so foreground/content images
  //    inside the content wrapper are never mistaken for the background.
  const bgImg = slide.querySelector('.cmp-pagesectionwithbackgroundimage > img');
  if (bgImg && isDmUrl(bgImg.getAttribute('src'))) {
    return normalizeDmUrl(bgImg.getAttribute('src'));
  }

  // 4) Fallback: verified URL keyed off the slide's text.
  const text = slide.textContent || '';
  const hit = HERO_BG_BY_KEYWORD.find(([re]) => re.test(text));
  return hit ? hit[1] : '';
}

export default function parse(element, { document }) {
  let slides = Array.from(element.querySelectorAll(':scope .cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.pagehero, .pagesectionwithbackgroundimage'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Background: resolve a DM URL from <img>, CSS attrs, or the keyword map,
    // then materialize it as an <img> for the DM transformer/auto-block.
    const bgUrl = resolveSlideBg(slide);
    let bg = null;
    if (bgUrl) {
      bg = document.createElement('img');
      bg.setAttribute('src', bgUrl);
      bg.setAttribute('alt', '');
    }

    // Text/CTA content = the entire content wrapper (excludes the bg img, which
    // is its sibling). Fall back to collecting titles/text/CTAs individually.
    let textCell = slide.querySelector('.cmp-pagesectionwithbackgroundimage__contentWrapper');
    if (!textCell) {
      const collected = [];
      slide.querySelectorAll('.cmp-title, .cmp-text, .cmp-embed, a.cmp-linkcalltoaction, a.cmp-applynowcta, a.btn')
        .forEach((node) => {
          if (collected.some((s) => s.contains(node))) return;
          collected.push(node);
        });
      textCell = collected;
    }

    const hasText = textCell && (textCell.length === undefined || textCell.length > 0);
    if (!bg && !hasText) return;
    cells.push([bg || '', hasText ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}

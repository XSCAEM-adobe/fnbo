/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-quote. Base: carousel.
 * Source: https://www.fnbo.com/ (#testimonials customer quotes carousel)
 * Convention (Carousel): 2 columns. Row 1 = block name. Each subsequent row =
 *   1 slide: cell 1 = image, cell 2 = text.
 *
 * This is a text-only quote rotator (no per-slide image), so cell 1 is left
 * empty and cell 2 holds the quote blockquote + author attribution. Also
 * preserves the leading section heading ("What our customers are saying") as a
 * first row if present.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Optional leading section heading.
  const heading = element.querySelector('.cmp-title__text, h2.cmp-title__text, h2');
  if (heading && heading.textContent.trim()) {
    const h = document.createElement('h2');
    h.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    cells.push(['', h]);
  }

  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.quotation, .cmp-quotation'));
  }

  slides.forEach((slide) => {
    const quote = slide.querySelector('blockquote, .cmp-quotation__content__figure__text');
    const nameEl = slide.querySelector('.cmp-quotation__content__figure__person__name');
    const titleEl = slide.querySelector('.cmp-quotation__content__figure__person__title');

    const textCell = [];
    if (quote) {
      const p = document.createElement('p');
      p.textContent = quote.textContent.replace(/\s+/g, ' ').trim();
      textCell.push(p);
    }
    const nameText = nameEl ? nameEl.textContent.trim() : '';
    const titleText = titleEl ? titleEl.textContent.trim() : '';
    const attribution = [nameText, titleText].filter(Boolean).join(', ');
    if (attribution) {
      const p = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = attribution;
      p.appendChild(em);
      textCell.push(p);
    }

    if (!textCell.length) return;
    cells.push(['', textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-quote', cells });
  element.replaceWith(block);
}

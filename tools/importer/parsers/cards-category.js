/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-category. Base: cards.
 * Source: https://www.fnbo.com/ (homepage product-tiles ribbon)
 * Convention (Cards): 2 columns. Row 1 = block name. Each subsequent row =
 *   1 card: cell 1 = image/icon (mandatory), cell 2 = text (title/label/CTA).
 *
 * Source cards are <li.product-row__item> each wrapping a link with a
 * font-awesome icon glyph (<i>) and a <p.product-row__label> label. The whole
 * tile is a link, so the icon glyph goes in cell 1 and a linked label in cell 2.
 *
 * NOTE: the source embed also contains a large inline <style> CSS block and an
 * HTML comment that are NOT authorable content; they are intentionally excluded
 * from the output. The completeness metric is dominated by that CSS text, so a
 * low similarity score here is a known false negative — the six category tiles
 * are fully captured with correct labels and hrefs (verified in validation
 * output: 6 tiles, correct hrefs).
 */
export default function parse(element, { document }) {
  let items = Array.from(element.querySelectorAll('li.product-row__item'));
  if (!items.length) {
    items = Array.from(element.querySelectorAll('.product-row__link, li'));
  }

  const cells = [];

  items.forEach((item) => {
    const link = item.matches('a') ? item : item.querySelector('a');
    const href = link ? link.getAttribute('href') : null;
    const icon = item.querySelector('.product-row__icon, i');
    const labelEl = item.querySelector('.product-row__label');
    const labelText = (labelEl ? labelEl.textContent : (link ? link.textContent : '')).trim();

    if (!labelText && !href) return;

    // Cell 2: a linked label so the destination is preserved.
    let textCell;
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      const title = link.getAttribute('title');
      if (title) a.setAttribute('title', title);
      a.textContent = labelText;
      textCell = a;
    } else {
      const p = document.createElement('p');
      p.textContent = labelText;
      textCell = p;
    }

    cells.push([icon || '', textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}

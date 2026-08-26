/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards.
 * Source: https://www.fnbo.com/personal-banking/checking/free-checking
 *   (feature-icons-4up — value-prop icon + title + description features)
 * Convention (Cards): 2 columns. Row 1 = block name. Each subsequent row =
 *   1 card: cell 1 = image/icon (mandatory), cell 2 = text (title + description).
 *
 * Source cards are .cmp-columnrow__item columns, each with an .icon glyph and
 * two .cmp-text blocks (an <h2> title and a <p> description). Icon glyph goes in
 * cell 1; title + description in cell 2.
 */
export default function parse(element, { document }) {
  const row = element.querySelector('.row.cmp-columnrow');
  let items = row
    ? Array.from(row.children).filter((c) => c.classList.contains('cmp-columnrow__item'))
    : [];
  if (!items.length) {
    items = Array.from(element.querySelectorAll('.cmp-columnrow__item'));
  }

  const cells = [];

  items.forEach((item) => {
    const icon = item.querySelector('.icon .cmp-icon, .icon i, .cmp-icon, i');

    const textCell = [];
    item.querySelectorAll('.cmp-text').forEach((t) => {
      if (t.textContent.trim()) textCell.push(t);
    });

    if (!icon && !textCell.length) return;
    cells.push([icon || '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}

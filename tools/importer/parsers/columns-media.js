/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Source: https://www.fnbo.com/personal-banking/checking/free-checking
 *   (why-checking-columns, gobankingrates-award, mobile-banking)
 * Convention (Columns): row 1 = block name. Row 2 = one row with N cells, each
 *   cell = one column's content (text/list/CTA or image). Additional rows keep
 *   the same column count.
 *
 * Source is a .columnrow > .row.cmp-columnrow containing N
 * .cmp-columnrow__item children, each a column. We map each column item to one
 * cell, preserving its inner content (title, text/list, image, CTAs) as-is.
 */
export default function parse(element, { document }) {
  // Find the primary column row. Prefer a direct .row.cmp-columnrow.
  const row = element.querySelector('.row.cmp-columnrow');
  let columns = row
    ? Array.from(row.children).filter((c) => c.classList.contains('cmp-columnrow__item'))
    : [];

  if (!columns.length) {
    // Fallback: any .cmp-columnrow__item under the element.
    columns = Array.from(element.querySelectorAll('.cmp-columnrow__item'));
  }

  const rowCells = [];
  columns.forEach((col) => {
    // Use the column's inner container content if present, else the column itself.
    const inner = col.querySelector(':scope > .contentcontainer, :scope > .cmp-container') || col;
    if (inner.textContent.trim() || inner.querySelector('img')) {
      rowCells.push(inner);
    }
  });

  if (rowCells.length < 1) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [rowCells];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}

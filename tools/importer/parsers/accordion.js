/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion. Base: accordion.
 * Source: https://www.fnbo.com/personal-banking/checking/free-checking
 *   (faq-accordion — expandable FAQ Q&A rows)
 * Convention (Accordion): 2 columns. Each row = one item: cell 1 = title/
 *   question (mandatory), cell 2 = content/answer (mandatory).
 *
 * Source items are .cmp-accordion__item, each with a .cmp-accordion__title
 * (question) and a .cmp-accordion__panel containing the answer text block(s).
 */
export default function parse(element, { document }) {
  let items = Array.from(element.querySelectorAll('.cmp-accordion__item'));
  if (!items.length) {
    items = Array.from(element.querySelectorAll('[class*="accordion__item"]'));
  }

  const cells = [];

  items.forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__header, button');
    const questionText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

    const panel = item.querySelector('.cmp-accordion__panel');
    // Answer = the meaningful content of the panel (text blocks), else the panel.
    let answer;
    if (panel) {
      const inner = Array.from(panel.querySelectorAll('.cmp-text'));
      answer = inner.length ? inner : panel;
    }

    if (!questionText && !answer) return;

    const questionCell = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = questionText;
    questionCell.appendChild(strong);

    cells.push([questionCell, answer || '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}

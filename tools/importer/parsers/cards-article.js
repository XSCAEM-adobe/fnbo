/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards.
 * Sources:
 *   - https://www.fnbo.com/ (homepage blog-teasers)
 *   - https://www.fnbo.com/personal-banking/checking/free-checking (Financial Tips)
 * Convention (Cards): 2 columns. Row 1 = block name. Each subsequent row =
 *   1 card: cell 1 = image (mandatory), cell 2 = text (title/date/CTA link).
 *
 * Source cards are <li.cmp-teaserlist__item>, each an <a> link container wrapping
 * a .pageteaser with an image (picture/img) and a .pageteaser__content title +
 * "Read Article/Read More" link. The whole card is a link, so the title is
 * emitted as a linked heading and the read-more as a linked CTA.
 */
export default function parse(element, { document }) {
  let items = Array.from(element.querySelectorAll('li.cmp-teaserlist__item'));
  if (!items.length) {
    items = Array.from(element.querySelectorAll('.pageteaser'));
  }

  const cells = [];

  items.forEach((item) => {
    const link = item.matches('a') ? item : item.querySelector('a.cmp-teaserlist__item__linkcontainer, a');
    const href = link ? link.getAttribute('href') : null;

    const img = item.querySelector('picture img, img');

    const titleEl = item.querySelector('.pageteaser__content__title, h1, h2, h3, h4');
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const dateEl = item.querySelector('.pageteaser__content__date, [class*="date"]');
    const dateText = dateEl ? dateEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const readEl = item.querySelector('.pageteaser__content__link');
    const readText = (readEl ? readEl.textContent : '').replace(/\s+/g, ' ').trim() || 'Read Article';

    const textCell = [];
    if (titleText) {
      const h = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = titleText;
        h.appendChild(a);
      } else {
        h.textContent = titleText;
      }
      textCell.push(h);
    }
    if (dateText) {
      const p = document.createElement('p');
      p.textContent = dateText;
      textCell.push(p);
    }
    if (href) {
      const cta = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = readText;
      cta.appendChild(a);
      textCell.push(cta);
    }

    if (!img && !textCell.length) return;
    cells.push([img || '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}

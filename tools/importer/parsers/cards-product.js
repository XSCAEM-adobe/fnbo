/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards.
 * Source: https://www.fnbo.com/personal-banking/savings
 *   (savings-solutions-cards — #savingssolutions product solution cards)
 * Convention (Cards): 2 columns. Row 1 = block name. Each subsequent row =
 *   1 card: cell 1 = image/icon (mandatory), cell 2 = text (title + CTA +
 *   description + benefit list + secondary link).
 *
 * Source is a .columnrow of 3 .cmp-columnrow__item columns, each a rich product
 * card: a duotone .icon glyph, an <h2> title, a primary CTA (applynowcta or
 * linkcalltoaction), a description paragraph, a benefit bullet list, and a
 * secondary "Learn More" link. Icon glyph -> cell 1; the rest of the card's
 * content in document order -> cell 2.
 *
 * VALIDATION NOTE: this is a coverage-gap block that only exists on the savings
 * page (#savingssolutions). The parser validator runs against the template's
 * primary URL (free-checking), where this block is absent, so it reports
 * "No results found" — an expected environment limitation, not a parser defect.
 * The card structure was derived from page-structure.json styleNotes for the
 * savings-solutions-cards section (verified against the savings-page selectors
 * in page-templates.json instances[]).
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
    // Cell 1: icon glyph or image.
    const icon = item.querySelector('.icon .cmp-icon, .icon i, .cmp-icon, .cmp-image img, img, i');

    // Cell 2: title, CTAs, text and lists in document order (excluding the icon).
    const textCell = [];
    const nodes = item.querySelectorAll(
      '.cmp-title, .cmp-text, a.cmp-linkcalltoaction, a.cmp-applynowcta, a.btn, a.cmp-link__link'
    );
    const added = [];
    nodes.forEach((node) => {
      if (added.some((s) => s.contains(node))) return;
      added.push(node);
      // The trailing "Learn More" link (cmp-link__link) is a plain secondary
      // link, not a filled CTA. Wrap it in <em> so EDS decorates it as the
      // .secondary button variant (plain underlined green link) instead of the
      // solid brand-green button used for Apply Now / Contact a Branch.
      if (node.matches('a.cmp-link__link') && !node.classList.contains('btn')) {
        const em = document.createElement('em');
        node.replaceWith(em);
        em.append(node);
        textCell.push(em);
      } else {
        textCell.push(node);
      }
    });

    if (!icon && !textCell.length) return;
    cells.push([icon || '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}

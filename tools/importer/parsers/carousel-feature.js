/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-feature. Base: carousel.
 * Source: https://www.fnbo.com/personal-banking/checking/free-checking
 *   (capable-carousel — "ONE THAT'S FREE" rotating feature slides)
 * Convention (Carousel): 2 columns. Row 1 = block name. Each subsequent row =
 *   1 slide: cell 1 = image (mandatory), cell 2 = text (heading/paragraph/CTA).
 *
 * Each slide is a .cmp-carousel__item with a .columnrow: an image column
 * (.image .cmp-image img, typically col-md-4) and a content column
 * (.contentcontainer with .cmp-title + .cmp-text, col-md-8).
 */
export default function parse(element, { document }) {
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.columnrow .row.cmp-columnrow'));
  }

  const cells = [];

  slides.forEach((slide) => {
    const img = slide.querySelector('.cmp-image img, img');

    const textCell = [];
    const nodes = slide.querySelectorAll('.cmp-title, .cmp-text, a.cmp-linkcalltoaction, a.cmp-applynowcta, a.btn');
    const added = [];
    nodes.forEach((node) => {
      if (added.some((s) => s.contains(node))) return;
      added.push(node);
      textCell.push(node);
    });

    if (!img && !textCell.length) return;
    cells.push([img || '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-feature', cells });
  element.replaceWith(block);
}

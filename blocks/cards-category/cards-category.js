import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Inline SVG icons approximating the source FontAwesome Pro "duotone light"
 * glyphs (fa-credit-card, fa-money-check-pen, fa-piggy-bank, fa-chart-mixed,
 * fa-house-chimney, fa-money-bill). FA Pro cannot be loaded here, so these
 * brand-green duotone-style SVGs stand in. Keyed by product label.
 */
const ICONS = {
  'credit card': '<svg viewBox="0 0 576 512" aria-hidden="true" focusable="false"><path fill="currentColor" fill-opacity="0.4" d="M0 128C0 92.7 28.7 64 64 64H512c35.3 0 64 28.7 64 64V192H0V128zM0 256H576V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256z"/><path fill="currentColor" d="M0 192H576v64H0V192zm112 96h96c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>',
  'free checking': '<svg viewBox="0 0 576 512" aria-hidden="true" focusable="false"><path fill="currentColor" fill-opacity="0.4" d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H320V352c0-17.7 14.3-32 32-32H512V96c0-35.3-28.7-64-64-64H64zM96 160c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16z"/><path fill="currentColor" d="M112 144H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zM571.3 251.3c6.2-6.2 6.2-16.4 0-22.6l-32-32c-6.2-6.2-16.4-6.2-22.6 0L400 313.4V384h70.6L571.3 251.3z"/></svg>',
  savings: '<svg viewBox="0 0 576 512" aria-hidden="true" focusable="false"><path fill="currentColor" fill-opacity="0.4" d="M400 96l0 .7c-5.3-.4-10.6-.7-16-.7H176c-5.4 0-10.7 .2-16 .7V96c0-53 43-96 96-96s96 43 96 96zM160 96.7c5.3-.5 10.6-.7 16-.7H400c5.4 0 10.7 .2 16 .7c78.5 6.6 143.9 60 163 132.3c1.3 5 5.7 8.7 10.8 8.7H608c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H584.4c-8.5 0-16.1 5.3-19 13.3c-9.8 27.3-26.7 51.2-48.5 69.3V480c0 17.7-14.3 32-32 32H432c-17.7 0-32-14.3-32-32V464H240v16c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32V446.6c-31.7-26.3-52.5-63.9-56.7-106.6H32c-17.7 0-32-14.3-32-32V288c0-17.7 14.3-32 32-32c17.7 0 32 14.3 32 32v0c0 4.4 3.6 8 8 8h.7c4.9 0 9.1-3.4 10.5-8.1C99.6 172.5 155.5 111.9 160 96.7z"/><path fill="currentColor" d="M480 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>',
  cds: '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path fill="currentColor" fill-opacity="0.4" d="M32 32C14.3 32 0 46.3 0 64V400c0 44.2 35.8 80 80 80H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16V64c0-17.7-14.3-32-32-32z"/><path fill="currentColor" d="M480 96c0-17.7-14.3-32-32-32s-32 14.3-32 32V320c0 17.7 14.3 32 32 32s32-14.3 32-32V96zM352 160c0-17.7-14.3-32-32-32s-32 14.3-32 32V320c0 17.7 14.3 32 32 32s32-14.3 32-32V160zM224 224c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V224zM96 288c0-17.7-14.3-32-32-32s-32 14.3-32 32v32c0 17.7 14.3 32 32 32s32-14.3 32-32V288z"/></svg>',
  mortgage: '<svg viewBox="0 0 576 512" aria-hidden="true" focusable="false"><path fill="currentColor" fill-opacity="0.4" d="M272.5 5.7c9-4.7 19.9-4.7 28.9 0l224 117.4c11.7 6.1 16.2 20.6 10.1 32.3s-20.6 16.2-32.3 10.1L288 51.8 52.8 165.5c-11.7 6.1-26.2 1.6-32.3-10.1S18.7 129.2 30.5 123.1L272.5 5.7z"/><path fill="currentColor" d="M288 76.8L96 176.9V416c0 26.5 21.5 48 48 48h96V352c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32V464h96c26.5 0 48-21.5 48-48V176.9L288 76.8zM480 128V96H416v32l64 32z"/></svg>',
  'personal loans': '<svg viewBox="0 0 640 512" aria-hidden="true" focusable="false"><path fill="currentColor" fill-opacity="0.4" d="M0 128C0 92.7 28.7 64 64 64H576c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zm64 32c0 17.7-14.3 32-32 32v0 0 128v0 0c17.7 0 32 14.3 32 32H576c0-17.7 14.3-32 32-32v0 0V192v0 0c-17.7 0-32-14.3-32-32H64z"/><path fill="currentColor" d="M320 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>',
};

function iconFor(label) {
  return ICONS[label.trim().toLowerCase()] || '';
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    // Second cell holds the label link; first (empty) cell was the source icon.
    const link = row.querySelector('a');
    const labelText = link ? link.textContent.trim() : (cells[cells.length - 1]?.textContent.trim() || '');
    const href = link ? link.getAttribute('href') : '#';

    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const a = document.createElement('a');
    a.className = 'cards-category-link';
    a.href = href;

    const card = document.createElement('div');
    card.className = 'cards-category-card';

    const icon = document.createElement('span');
    icon.className = 'cards-category-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = iconFor(labelText);

    const label = document.createElement('p');
    label.className = 'cards-category-label';
    label.textContent = labelText;

    card.append(icon, label);
    a.append(card);
    li.append(a);
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}

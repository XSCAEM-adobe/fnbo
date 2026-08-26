import { getMetadata } from '../../scripts/aem.js';

/**
 * Restore footer image src attributes. The fragment is authored with relative
 * `images/foo.svg` src values, but the Document Authoring pipeline strips
 * unknown img src to `about:error` when the fragment is stored. Every footer
 * image has a stable `alt`, so remap alt -> the code-bus image path
 * (/content/images/...) which serves the committed SVG/PNG assets. Also handles
 * the local/aem-up case where src is still `images/...`.
 * @param {Element} scope Container with the raw fragment
 */
function restoreFooterImages(scope) {
  const byAlt = {
    'First National Bank of Omaha Logo': 'footer-fnbo-logo-white.svg',
    LinkedIn: 'social-linkedin.svg',
    Facebook: 'social-facebook.svg',
    'Twitter/X': 'social-x.svg',
    Instagram: 'social-instagram.svg',
    TikTok: 'social-tiktok.svg',
    Pinterest: 'social-pinterest.svg',
    YouTube: 'social-youtube.svg',
    'Equal Housing Lender Logo': 'equal-housing-logo.png',
  };
  scope.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('/content/images/')) return; // already correct
    if (src.startsWith('images/')) {
      img.setAttribute('src', `/content/${src}`);
      return;
    }
    const file = byAlt[img.getAttribute('alt')];
    if (file) img.setAttribute('src', `/content/images/${file}`);
  });
}

/**
 * Fetch the footer fragment HTML.
 * Local/aem-up: /content/footer.plain.html. DA/EDS production: `${footerPath}.plain.html`.
 * @param {string} footerPath Footer doc path (without the .plain.html suffix)
 * @returns {Promise<Element|null>} Container element with the fragment children, or null
 */
async function fetchFooterFragment(footerPath) {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    resp = await fetch(`${footerPath}.plain.html`);
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  const container = document.createElement('div');
  container.innerHTML = html;
  restoreFooterImages(container);
  return container;
}

/**
 * Decorate the social icon list (first section's <ul> of image links).
 * @param {Element} scope The block scope
 */
function decorateSocial(scope) {
  const socialList = scope.querySelector('.footer-brand ul');
  if (socialList) socialList.classList.add('footer-social');
}

/**
 * Wire up link column sections (heading + list of links).
 * @param {Element} scope The block scope
 */
function decorateColumns(scope) {
  scope.querySelectorAll(':scope > .footer-section').forEach((section) => {
    const heading = section.querySelector('h2');
    if (heading && section.querySelector('ul a')) {
      section.classList.add('footer-links');
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : '/footer';

  const fragment = await fetchFooterFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-content';

  if (fragment) {
    const sections = [...fragment.children];
    sections.forEach((section, i) => {
      section.classList.add('footer-section');
      // First section = brand (logo + tagline + social icons)
      if (i === 0) section.classList.add('footer-brand');
      // Last section = legal / disclaimer block (contains the <hr>)
      if (section.querySelector('hr')) section.classList.add('footer-legal');
      footer.append(section);
    });

    decorateSocial(footer);
    decorateColumns(footer);
  }

  block.append(footer);
}

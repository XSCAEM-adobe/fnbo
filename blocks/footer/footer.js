import { getMetadata } from '../../scripts/aem.js';

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
  // The fragment lives at /content/ and references images relatively
  // (images/foo.svg), which 404 on deeper pages. Rewrite to absolute
  // /content/images/ so the logo + social icons load at any URL depth.
  container.querySelectorAll('img[src^="images/"]').forEach((img) => {
    img.setAttribute('src', `/content/${img.getAttribute('src')}`);
  });
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

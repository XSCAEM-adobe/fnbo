import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Desktop breakpoint — mobile behavior is implemented in a later phase.
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Restore nav image src attributes. The fragment is authored with relative
 * `images/foo.svg` src values, but Document Authoring strips unknown img src to
 * `about:error` when the fragment is stored. Remap by alt (logo/FDIC/promo),
 * and — for the utility icons which have empty alt — by their anchor href, to
 * the code-bus image path (/content/images/...) which serves the committed
 * assets. Also handles the local/aem-up case where src is still `images/...`.
 * @param {Element} scope Container with the raw fragment
 */
function restoreNavImages(scope) {
  const byAlt = {
    FDIC: 'fdic-logo-white.svg',
    'FNBO Logo': 'fnbo-logo-white.svg',
    'FNBO Debit Card': 'promo-debit-card.png',
  };
  const byHref = {
    '/branch-locations/branch-atm-locator': 'icon-location-dot.svg',
    '/contact-us': 'icon-phone.svg',
    '/tools-resources/calculators': 'icon-calculator.svg',
    '/search': 'icon-search.svg',
  };
  scope.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('/content/images/')) return; // already correct
    if (src.startsWith('images/')) {
      img.setAttribute('src', `/content/${src}`);
      return;
    }
    let file = byAlt[img.getAttribute('alt')];
    if (!file) {
      const anchor = img.closest('a');
      const href = anchor ? anchor.getAttribute('href') : null;
      if (href && byHref[href]) file = byHref[href];
    }
    if (file) img.setAttribute('src', `/content/images/${file}`);
  });
}

/**
 * Close any open category dropdown panels within the secondary nav row.
 * @param {Element} scope element containing the category items
 */
function closeAllPanels(scope) {
  scope.querySelectorAll('.nav-cat.is-open').forEach((cat) => {
    cat.classList.remove('is-open');
    const trigger = cat.querySelector(':scope > button');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Build the FDIC disclosure bar (section 0 of the fragment).
 * @param {Element} sectionEl raw fragment section
 * @returns {Element}
 */
function buildFdicBar(sectionEl) {
  const bar = document.createElement('div');
  bar.className = 'nav-fdic';
  bar.append(...sectionEl.childNodes);
  return bar;
}

/**
 * Build the brand row (logo).
 * @param {Element} sectionEl raw fragment section
 * @returns {Element}
 */
function buildBrand(sectionEl) {
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  brand.append(...sectionEl.childNodes);
  const link = brand.querySelector('a');
  if (link) link.setAttribute('aria-label', 'FNBO Home');
  return brand;
}

/**
 * Build the tools cluster (utility links + Log In).
 * @param {Element} sectionEl raw fragment section
 * @returns {Element}
 */
function buildTools(sectionEl) {
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  tools.append(...sectionEl.childNodes);
  // The standalone paragraph link is the primary CTA (Log In); the following
  // <ul> (if present) is the Log In dropdown (account portals + help/enroll).
  const ctaWrapper = tools.querySelector(':scope > p');
  const cta = ctaWrapper ? ctaWrapper.querySelector('a') : null;
  if (cta) {
    cta.classList.add('nav-login');
    ctaWrapper.classList.add('nav-login-wrapper');
    const menu = ctaWrapper.nextElementSibling;
    if (menu && menu.tagName === 'UL') {
      // Wrap CTA + menu in a dropdown container.
      const dropdown = document.createElement('div');
      dropdown.className = 'nav-login-dropdown';
      ctaWrapper.replaceWith(dropdown);
      dropdown.append(ctaWrapper);
      menu.classList.add('nav-login-menu');
      dropdown.append(menu);
      cta.setAttribute('aria-expanded', 'false');
      cta.addEventListener('click', (e) => {
        e.preventDefault();
        const open = dropdown.classList.toggle('is-open');
        cta.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }
  return tools;
}

/**
 * Split the sections tree into: the green-bar section list (level 1) and,
 * for each section, its category list (level 2) with dropdown panels (level 3).
 * Fully data-driven — reads whatever the fragment provides.
 * @param {Element} sectionEl raw fragment section containing the top <ul>
 * @returns {{ bar: Element, sub: Element }}
 */
function buildSections(sectionEl) {
  const topUl = sectionEl.querySelector(':scope > ul');

  // Green-bar top-level section list.
  const bar = document.createElement('div');
  bar.className = 'nav-sections';
  const barList = document.createElement('ul');
  barList.className = 'nav-section-list';
  bar.append(barList);

  // White secondary row — holds every section's categories (only the active
  // section's group is visible; the rest are hidden but present in the DOM).
  const sub = document.createElement('div');
  sub.className = 'nav-subnav';
  const subList = document.createElement('div');
  subList.className = 'nav-cat-list';
  sub.append(subList);

  const sections = [];

  Array.from(topUl.children).forEach((li, sectionIndex) => {
    // Document Authoring wraps bare anchors in a <p>, so the section/category
    // link may be either a direct <a> child or nested in a <p> (`<li><p><a>`).
    const sectionLink = li.querySelector(':scope > a, :scope > p > a');
    const categoriesUl = li.querySelector(':scope > ul');

    // Top-level section entry in the green bar.
    const barItem = document.createElement('li');
    barItem.className = 'nav-section';
    const barBtn = document.createElement('a');
    barBtn.className = 'nav-section-link';
    barBtn.textContent = sectionLink ? sectionLink.textContent.trim() : '';
    if (sectionLink) barBtn.href = sectionLink.getAttribute('href');
    barItem.append(barBtn);
    barList.append(barItem);

    // Build this section's category row (hidden unless active).
    const catFragment = document.createElement('ul');
    catFragment.className = 'nav-cat-group';
    if (categoriesUl) {
      Array.from(categoriesUl.children).forEach((catLi) => {
        const catLink = catLi.querySelector(':scope > a, :scope > p > a');
        const panelUl = catLi.querySelector(':scope > ul');
        // Promo nodes are standalone <p>s — but exclude the <p> that merely
        // wraps the category link (DA wraps bare anchors in <p>).
        const promoNodes = Array.from(catLi.children)
          .filter((c) => c.tagName === 'P' && !c.querySelector(':scope > a'));

        const cat = document.createElement('li');
        cat.className = 'nav-cat';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'nav-cat-trigger';
        trigger.textContent = catLink ? catLink.textContent.trim() : '';
        const href = catLink ? catLink.getAttribute('href') : null;

        // A category with a panel opens a dropdown; one without navigates.
        if (panelUl || promoNodes.length) {
          trigger.setAttribute('aria-expanded', 'false');
          if (href) trigger.dataset.href = href;
          cat.append(trigger);

          const panel = document.createElement('div');
          panel.className = 'nav-panel';
          if (panelUl) {
            const links = document.createElement('ul');
            links.className = 'nav-panel-links';
            links.append(...panelUl.children);
            panel.append(links);
          }
          if (promoNodes.length) {
            const promo = document.createElement('div');
            promo.className = 'nav-panel-promo';
            promo.append(...promoNodes);
            panel.append(promo);
          }
          cat.append(panel);
        } else if (href) {
          const catA = document.createElement('a');
          catA.className = 'nav-cat-trigger';
          catA.href = href;
          catA.textContent = trigger.textContent;
          cat.append(catA);
        } else {
          cat.append(trigger);
        }

        catFragment.append(cat);
      });
    }

    // Each section's categories live in their own group inside the subnav so
    // ALL section content is present in the DOM (source pre-renders the full
    // tree). Inactive groups are hidden via CSS.
    catFragment.classList.add('nav-cat-group');
    subList.append(catFragment);

    sections.push({
      barItem, barBtn, catFragment, index: sectionIndex,
    });
  });

  return {
    bar, sub, subList, sections,
  };
}

/**
 * Show a given section's categories in the secondary row and mark it active.
 * @param {object} model built sections model
 * @param {number} activeIndex index to activate
 */
function activateSection(model, activeIndex) {
  const { sections } = model;
  sections.forEach((s) => {
    const active = s.index === activeIndex;
    s.barItem.classList.toggle('is-active', active);
    s.catFragment.classList.toggle('is-active-group', active);
  });
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment — localhost first, then DA/EDS production path.
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  let fragment;
  // localhost / aem up serves the plain fragment directly; DA/EDS uses navPath.
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    resp = await fetch(`${navPath}.plain.html`);
  }
  if (resp.ok) {
    const html = await resp.text();
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    restoreNavImages(tmp);
    fragment = tmp;
  } else {
    fragment = await loadFragment(navPath);
  }

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  const rawSections = Array.from(fragment.children).filter((c) => c.tagName === 'DIV');
  // Expected fragment order: [0] FDIC, [1] brand, [2] sections tree, [3] tools.
  const fdicEl = rawSections[0] ? buildFdicBar(rawSections[0]) : null;
  const brandEl = rawSections[1] ? buildBrand(rawSections[1]) : null;
  const sectionsModel = rawSections[2] ? buildSections(rawSections[2]) : null;
  const toolsEl = rawSections[3] ? buildTools(rawSections[3]) : null;

  // Assemble the three visual rows.
  if (fdicEl) nav.append(fdicEl);

  const mainRow = document.createElement('div');
  mainRow.className = 'nav-main';
  if (brandEl) mainRow.append(brandEl);
  if (sectionsModel) mainRow.append(sectionsModel.bar);
  if (toolsEl) mainRow.append(toolsEl);

  // Hamburger (mobile) — behavior wired in a later phase; present for structure.
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation" aria-expanded="false">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  mainRow.prepend(hamburger);

  nav.append(mainRow);
  if (sectionsModel) nav.append(sectionsModel.sub);

  // Default active section is the first (Personal).
  if (sectionsModel) {
    activateSection(sectionsModel, 0);

    // Category dropdown open/close (hover on desktop, click as fallback/toggle).
    const { sub } = sectionsModel;

    sub.addEventListener('mouseover', (e) => {
      if (!isDesktop.matches) return;
      const cat = e.target.closest('.nav-cat');
      if (!cat || !cat.querySelector(':scope > .nav-panel')) return;
      closeAllPanels(sub);
      cat.classList.add('is-open');
      const trigger = cat.querySelector(':scope > .nav-cat-trigger');
      if (trigger && trigger.tagName === 'BUTTON') trigger.setAttribute('aria-expanded', 'true');
    });

    sub.addEventListener('mouseleave', () => {
      if (!isDesktop.matches) return;
      closeAllPanels(sub);
    });

    sub.addEventListener('click', (e) => {
      const trigger = e.target.closest('.nav-cat-trigger');
      if (!trigger || trigger.tagName !== 'BUTTON') return;
      const cat = trigger.closest('.nav-cat');
      const hasPanel = !!cat.querySelector(':scope > .nav-panel');
      if (!hasPanel) return;
      const willOpen = !cat.classList.contains('is-open');
      closeAllPanels(sub);
      if (willOpen) {
        cat.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // Hamburger (mobile): toggle the drawer open/closed, lock body scroll, and
  // keep aria-expanded in sync. The CSS reveals .nav-sections + .nav-subnav +
  // .nav-tools as a stacked drawer when nav.is-menu-open is set.
  const hamburgerBtn = hamburger.querySelector('button');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('is-menu-open');
      hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamburgerBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.body.style.overflowY = open ? 'hidden' : '';
    });
  }

  // Mobile: tapping a top-level section link switches which section's category
  // group is shown (accordion-style), instead of navigating. On desktop the
  // link navigates normally.
  if (sectionsModel) {
    sectionsModel.sections.forEach((s) => {
      s.barBtn.addEventListener('click', (e) => {
        if (isDesktop.matches) return;
        e.preventDefault();
        const alreadyActive = s.barItem.classList.contains('is-active');
        closeAllPanels(sectionsModel.sub);
        activateSection(sectionsModel, alreadyActive ? -1 : s.index);
      });
    });
  }

  // Close panels when focus/pointer leaves the header entirely.
  document.addEventListener('click', (e) => {
    if (sectionsModel && !nav.contains(e.target)) closeAllPanels(sectionsModel.sub);
  });
  nav.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && sectionsModel) closeAllPanels(sectionsModel.sub);
  });

  // Reset transient state when crossing the desktop/mobile boundary on resize.
  isDesktop.addEventListener('change', () => {
    if (sectionsModel) closeAllPanels(sectionsModel.sub);
    const hb = nav.querySelector('.nav-hamburger button');
    if (hb) hb.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-menu-open');
    document.body.style.overflowY = '';
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}

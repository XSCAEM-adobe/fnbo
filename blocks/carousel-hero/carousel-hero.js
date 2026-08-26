import { fetchPlaceholders } from '../../scripts/aem.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-hero');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-hero-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-hero-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-hero-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-hero-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-hero-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-hero-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  // Restructure the content cell into a media column (card art + brand wordmark)
  // and a copy column (heading/subhead/CTA/small print) so image-bearing slides
  // render card-left / copy-right like the source. The importer collapses the
  // slide copy into a single wrapping <p> whose leading children are the images
  // (or <picture>) and whose trailing children are the copy paragraphs; text-only
  // slides have no leading image and are left untouched.
  const content = slide.querySelector('.carousel-hero-slide-content');
  if (content) {
    // Flatten a single wrapping <p> that holds everything (importer artifact).
    if (content.children.length === 1 && content.firstElementChild.tagName === 'P'
        && content.firstElementChild.querySelector('picture, img')) {
      const only = content.firstElementChild;
      while (only.firstChild) content.append(only.firstChild);
      only.remove();
    }
    // Wrap any bare inline nodes (pictures/text) into paragraphs is not needed;
    // partition top-level children into media (contains an image) vs copy.
    const nodes = [...content.childNodes].filter(
      (n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()),
    );
    const media = document.createElement('div');
    media.className = 'carousel-hero-slide-media';
    const copy = document.createElement('div');
    copy.className = 'carousel-hero-slide-copy';
    let seenCopy = false;
    nodes.forEach((n) => {
      const isImage = n.nodeType === 1 && (n.tagName === 'PICTURE' || n.tagName === 'IMG'
        || (n.querySelector && n.querySelector('picture, img') && !n.textContent.trim()));
      if (isImage && !seenCopy) media.append(n);
      else { seenCopy = true; copy.append(n); }
    });
    if (media.children.length && copy.childNodes.length) {
      content.append(media, copy);
    } else {
      // no split possible — restore nodes in order
      nodes.forEach((n) => content.append(n));
    }

    // The evergreen wordmark asset is natively ~400px wide but Scene7 pads it to
    // the requested render width (the DM auto-block asks for wid=2000), yielding a
    // 2000x65 canvas where the glyphs occupy only the leftmost ~400px. That makes
    // it render tiny. Retarget any wide-but-short wordmark rendition to its native
    // width so its aspect ratio (and displayed height) is correct.
    media.querySelectorAll('picture').forEach((pic) => {
      const wImg = pic.querySelector('img');
      if (!wImg || !/evergreen-white-logo|wordmark|-logo\b/i.test(wImg.src)) return;
      const retarget = (url) => url.replace(/([?&])wid=\d+/g, '$1wid=400');
      pic.querySelectorAll('source').forEach((s) => {
        if (s.srcset) s.srcset = retarget(s.srcset);
      });
      wImg.src = retarget(wImg.src);
    });
  }

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-hero-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-hero-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-hero-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-hero-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-hero-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-hero-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}

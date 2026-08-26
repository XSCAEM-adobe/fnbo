/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsArticleParser from './parsers/cards-article.js';
import carouselQuoteParser from './parsers/carousel-quote.js';
import heroBannerParser from './parsers/hero-banner.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/fnbo-cleanup.js';
import dmImagesTransformer from './transformers/fnbo-dm-images.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards-category': cardsCategoryParser,
  'cards-article': cardsArticleParser,
  'carousel-quote': carouselQuoteParser,
  'hero-banner': heroBannerParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'FNBO marketing homepage: carousel hero, product tiles ribbon, blog teaser cards, customer testimonials carousel, community and independent-bank promo bands.',
  urls: [
    'https://www.fnbo.com/',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.carousel.panelcontainer.ss-carousel-hero.dark.ss-large.aem-GridColumn.aem-GridColumn--default--12',
      ],
    },
    {
      name: 'cards-category',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesection.responsivegrid.ss-pagesectionheight-ribbon.aem-GridColumn.aem-GridColumn--default--12',
      ],
    },
    {
      name: 'cards-article',
      instances: [
        '#blogTeaser > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaserlist.ss-presentation-card.ss-layout-4upgrid.aem-GridColumn.aem-GridColumn--default--12',
      ],
    },
    {
      name: 'carousel-quote',
      instances: [
        '#testimonials',
      ],
      section: 'highlight',
    },
    {
      // Matches BOTH promo bands (community "verytall" + independent-bank).
      // Dropping the ss-pagesectionheight-verytall class from the selector
      // makes it match the community band AND the independent-bank band
      // (mother-child-biking), which otherwise fell back to a plain
      // brand-green band with no background photo.
      name: 'hero-banner',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundimage.responsivegrid.ss-backgroundbrightness-dark.ss-overlaystrength-40.aem-GridColumn.aem-GridColumn--default--12',
      ],
    },
    {
      name: 'section-brand-strip',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12 > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundcolor.pagesection.responsivegrid.ss-backgroundcolor-primary.ss-backgroundbrightness-dark.aem-GridColumn.aem-GridColumn--default--12',
      ],
      section: 'brand-green',
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    // Skip section-* entries: they are section styling mappings, not parseable blocks
    if (blockDef.name.startsWith('section-')) return;
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + DM image anchors)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};

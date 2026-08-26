/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import columnsMediaParser from './parsers/columns-media.js';
import carouselFeatureParser from './parsers/carousel-feature.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import accordionParser from './parsers/accordion.js';
import cardsArticleParser from './parsers/cards-article.js';
import cardsProductParser from './parsers/cards-product.js';
import videoParser from './parsers/video.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/fnbo-cleanup.js';
import dmImagesTransformer from './transformers/fnbo-dm-images.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'columns-media': columnsMediaParser,
  'carousel-feature': carouselFeatureParser,
  'cards-feature': cardsFeatureParser,
  accordion: accordionParser,
  'cards-article': cardsArticleParser,
  'cards-product': cardsProductParser,
  video: videoParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'personal-banking-product',
  description: 'Personal banking product landing page: full-bleed image page hero with title and CTA, breadcrumb, content sections (feature columns, icon feature grid, FAQ accordion or product cards, video embeds), 4-up financial tips teaser list, and legal disclaimers.',
  urls: [
    'https://www.fnbo.com/personal-banking/checking/free-checking',
    'https://www.fnbo.com/personal-banking/savings',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagehero.pagesectionwithbackgroundimage.responsivegrid.ss-heroheight-verytall.aem-GridColumn.aem-GridColumn--default--12',
      ],
    },
    {
      name: 'columns-media',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesection.responsivegrid.ss-contentcontainersize-narrow.aem-GridColumn.aem-GridColumn--default--12:not(.ss-pagesectionheight-short):nth-of-type(2)',
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.experiencefragment.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5)',
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundcolor.pagesection.responsivegrid.ss-backgroundcolor-primary.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(7)',
      ],
    },
    {
      name: 'carousel-feature',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundcolor.pagesection.responsivegrid.ss-backgroundcolor-primary.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)',
      ],
    },
    {
      name: 'cards-feature',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesection.responsivegrid.ss-contentcontainersize-narrow.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(4)',
      ],
    },
    {
      name: 'accordion',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesection.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(6) > div.cmp-pagesection > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.accordiongroup.accordion.panelcontainer.aem-GridColumn.aem-GridColumn--default--12',
      ],
    },
    {
      name: 'cards-article',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesection.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(8) > div.cmp-pagesection > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaserlist.ss-presentation-card.ss-layout-4upgrid.aem-GridColumn.aem-GridColumn--default--12',
        '#savingmoneyblogs div.teaserlist',
      ],
    },
    {
      name: 'cards-product',
      instances: [
        '#savingssolutions > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.columnrow.aem-GridColumn.aem-GridColumn--default--12',
        '#savingssolutions div.columnrow',
      ],
    },
    {
      name: 'video',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesection.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(6)',
      ],
    },
    {
      name: 'section-capable-carousel',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundcolor.pagesection.responsivegrid.ss-backgroundcolor-primary.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)',
      ],
      section: 'brand-green',
    },
    {
      name: 'section-gobankingrates',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.experiencefragment.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5)',
      ],
      section: 'highlight',
    },
    {
      name: 'section-mobile-banking',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundcolor.pagesection.responsivegrid.ss-backgroundcolor-primary.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(7)',
      ],
      section: 'brand-green',
    },
    {
      name: 'section-one-thats-free',
      instances: [
        '#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundcolor.pagesection.responsivegrid.ss-backgroundcolor-primary.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(10)',
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

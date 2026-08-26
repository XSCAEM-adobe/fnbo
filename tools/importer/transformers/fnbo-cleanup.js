/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: FNBO site-wide cleanup.
 *
 * Removes non-authorable AEM site chrome so the import contains only the
 * page-level authorable content that lives inside #main-content.
 *
 * All selectors verified against captured DOM:
 *   - migration-work/cleaned.html            (template: homepage)
 *   - migration-work-product/cleaned.html    (template: personal-banking-product)
 *
 * Chrome verified in captured DOM (shared by both templates unless noted):
 *   - div.experiencefragment.sticky-navbar > div#new-page-header  (sticky navbar header experience-fragment)
 *   - div#page-footer.cmp-experiencefragment--standard-page-footer (footer experience-fragment)
 *   - div.breadcrumbnavigation > nav.cmp-breadcrumbnavigation      (breadcrumb nav; product template only)
 *   - div.currentzipcodebanner > div.cmp-currentzipcodebanner      (current-zip-code banner; product template only)
 *   - section#soctLinks                                            (empty script container)
 *   - div#data-product-container                                   (empty script container)
 *   - div.be-ix-link-block                                         ('Also of Interest' related-links widget; #FNBO body child)
 *   - div.zipcodeentry / div.cmp-experiencefragment--default-zip-code-request-modal (zip-code entry modal chrome)
 *   - template#speedbump-modal-container                           (leave-site interstitial template)
 */

const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Modal / interstitial / tracking chrome removed before parsing so it
    // can't be matched by block parsers or leak into content. Selectors from
    // captured DOM (both templates).
    WebImporter.DOMUtils.remove(element, [
      'template#speedbump-modal-container',
      '.cmp-experiencefragment--default-zip-code-request-modal',
      '.zipcodeentry',
      // Cookie-consent preferences modal (cmp-cookieconsent__modal)
      '.cmp-cookieconsent',
      '.cmp-cookieconsent__modal',
      // Leave-site interstitial (rendered as .modal.cmp-speedbump)
      '.cmp-speedbump',
      // Existing-customer / product-rate detail / login modals
      '.existingcustomermodal',
      '.cmp-existingcustomermodal',
      '.productratedetailsmodal',
      '.cmp-productratedetailsmodal',
      '.cmp-loginlink',
      // Adobe Audience Manager / demdex ID-sync iframe + retarget pixels
      'iframe[src*="demdex.net"]',
      'iframe[title="Adobe ID Syncing iFrame"]',
      'img[src*="bttrack.com"]',
      'iframe[src*="doubleclick"]',
    ]);
  }

  if (hookName === H.after) {
    // Non-authorable site chrome. Selectors from captured DOM.
    WebImporter.DOMUtils.remove(element, [
      // Sticky navbar header experience-fragment (wrapper + inner XF)
      '.sticky-navbar',
      '#new-page-header',
      // Footer experience-fragment
      '#page-footer',
      // Breadcrumb navigation (product template)
      '.breadcrumbnavigation',
      // Current-zip-code banner (product template)
      '.currentzipcodebanner',
      // Empty script/data containers
      '#soctLinks',
      '#data-product-container',
      // Leftover non-authorable head-ish elements
      'link',
      'meta',
      'noscript',
      'style',
    ]);
  }
}

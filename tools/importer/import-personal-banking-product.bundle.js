/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-personal-banking-product.js
  var import_personal_banking_product_exports = {};
  __export(import_personal_banking_product_exports, {
    default: () => import_personal_banking_product_default
  });

  // tools/importer/parsers/hero-banner.js
  var BAND_BG_BY_KEYWORD = [
    [/more than a bank|neighbor you can count on|community/i, "https://s7d1.scene7.com/is/image/fnnistage/rodeo-rider-fnbo-flag-2x?ts=1770915583521&$Hero$&dpr=off"],
    [/independent bank/i, "https://s7d1.scene7.com/is/image/fnnistage/mother-child-biking-in-fields-2x?ts=1773164816165&$Hero$&dpr=off"]
  ];
  function isDmUrl(src) {
    if (!src) return false;
    try {
      return new URL(src, "https://x/").pathname.startsWith("/is/image/");
    } catch (e) {
      return false;
    }
  }
  function normalizeDmUrl(raw) {
    if (!raw) return "";
    let url = String(raw).trim().replace(/^url\(|\)$/gi, "").replace(/^['"]|['"]$/g, "");
    url = url.replace(/\{\.width\}/g, "");
    url = url.replace(/dpr=on,\{dpr\}/gi, "dpr=off");
    url = url.replace(/dpr=on,[\d.]+/gi, "dpr=off");
    if (!url.includes("?")) url += "?wid=2000&fmt=webp";
    return url;
  }
  function bgFromStyle(style) {
    if (!style) return "";
    const m = style.match(/url\(\s*(['"]?)([^'")]+)\1\s*\)/i);
    return m && m[2] ? m[2] : "";
  }
  function parse(element, { document }) {
    const cells = [];
    let bgUrl = "";
    const allImgs = Array.from(element.querySelectorAll("img"));
    const imgEl = allImgs.find((img) => !img.classList.contains("cmp-image__image"));
    if (imgEl && isDmUrl(imgEl.getAttribute("src"))) {
      bgUrl = normalizeDmUrl(imgEl.getAttribute("src"));
    } else if (imgEl && imgEl.getAttribute("src")) {
      bgUrl = imgEl.getAttribute("src");
    }
    if (!bgUrl) {
      const hook = element.querySelector("[data-background-style]");
      if (hook) {
        const raw = bgFromStyle(hook.getAttribute("data-background-style"));
        if (isDmUrl(raw)) bgUrl = normalizeDmUrl(raw);
      }
    }
    if (!bgUrl) {
      const carrier = element.querySelector('[data-cmp-is="pagesectionwithbackgroundimage"]');
      if (carrier && isDmUrl(carrier.getAttribute("data-cmp-src"))) {
        bgUrl = normalizeDmUrl(carrier.getAttribute("data-cmp-src"));
      }
    }
    if (!bgUrl) {
      const bgWrap = element.querySelector('.cmp-pagesectionwithbackgroundimage[style*="background"], [style*="background-image"]');
      const style = bgWrap ? bgWrap.getAttribute("style") || "" : "";
      const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
      if (m && m[2]) bgUrl = m[2];
    }
    if (!bgUrl) {
      const text = element.textContent || "";
      const hit = BAND_BG_BY_KEYWORD.find(([re]) => re.test(text));
      if (hit) bgUrl = hit[1];
    }
    let bg = null;
    if (bgUrl) {
      bg = document.createElement("img");
      bg.setAttribute("src", bgUrl);
      bg.setAttribute("alt", "");
    }
    const contentCell = [];
    const nodes = element.querySelectorAll(
      ".cmp-title, .cmp-text, a.cmp-linkcalltoaction, a.cmp-applynowcta, a.btn"
    );
    const added = [];
    nodes.forEach((node) => {
      if (added.some((s) => s.contains(node))) return;
      added.push(node);
      contentCell.push(node);
    });
    if (!bg && !contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (bg) cells.push([bg]);
    if (contentCell.length) cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function parse2(element, { document }) {
    const row = element.querySelector(".row.cmp-columnrow");
    let columns = row ? Array.from(row.children).filter((c) => c.classList.contains("cmp-columnrow__item")) : [];
    if (!columns.length) {
      columns = Array.from(element.querySelectorAll(".cmp-columnrow__item"));
    }
    const rowCells = [];
    columns.forEach((col) => {
      const inner = col.querySelector(":scope > .contentcontainer, :scope > .cmp-container") || col;
      if (inner.textContent.trim() || inner.querySelector("img")) {
        rowCells.push(inner);
      }
    });
    if (rowCells.length < 1) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [rowCells];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-feature.js
  function parse3(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (!slides.length) {
      slides = Array.from(element.querySelectorAll(".columnrow .row.cmp-columnrow"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector(".cmp-image img, img");
      const textCell = [];
      const nodes = slide.querySelectorAll(".cmp-title, .cmp-text, a.cmp-linkcalltoaction, a.cmp-applynowcta, a.btn");
      const added = [];
      nodes.forEach((node) => {
        if (added.some((s) => s.contains(node))) return;
        added.push(node);
        textCell.push(node);
      });
      if (!img && !textCell.length) return;
      cells.push([img || "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse4(element, { document }) {
    const row = element.querySelector(".row.cmp-columnrow");
    let items = row ? Array.from(row.children).filter((c) => c.classList.contains("cmp-columnrow__item")) : [];
    if (!items.length) {
      items = Array.from(element.querySelectorAll(".cmp-columnrow__item"));
    }
    const cells = [];
    items.forEach((item) => {
      const icon = item.querySelector(".icon .cmp-icon, .icon i, .cmp-icon, i");
      const textCell = [];
      item.querySelectorAll(".cmp-text").forEach((t) => {
        if (t.textContent.trim()) textCell.push(t);
      });
      if (!icon && !textCell.length) return;
      cells.push([icon || "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse5(element, { document }) {
    let items = Array.from(element.querySelectorAll(".cmp-accordion__item"));
    if (!items.length) {
      items = Array.from(element.querySelectorAll('[class*="accordion__item"]'));
    }
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title, .cmp-accordion__header, button");
      const questionText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const panel = item.querySelector(".cmp-accordion__panel");
      let answer;
      if (panel) {
        const inner = Array.from(panel.querySelectorAll(".cmp-text"));
        answer = inner.length ? inner : panel;
      }
      if (!questionText && !answer) return;
      const questionCell = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = questionText;
      questionCell.appendChild(strong);
      cells.push([questionCell, answer || ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse6(element, { document }) {
    let items = Array.from(element.querySelectorAll("li.cmp-teaserlist__item"));
    if (!items.length) {
      items = Array.from(element.querySelectorAll(".pageteaser"));
    }
    const cells = [];
    items.forEach((item) => {
      const link = item.matches("a") ? item : item.querySelector("a.cmp-teaserlist__item__linkcontainer, a");
      const href = link ? link.getAttribute("href") : null;
      const img = item.querySelector("picture img, img");
      const titleEl = item.querySelector(".pageteaser__content__title, h1, h2, h3, h4");
      const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const dateEl = item.querySelector('.pageteaser__content__date, [class*="date"]');
      const dateText = dateEl ? dateEl.textContent.replace(/\s+/g, " ").trim() : "";
      const readEl = item.querySelector(".pageteaser__content__link");
      const readText = (readEl ? readEl.textContent : "").replace(/\s+/g, " ").trim() || "Read Article";
      const textCell = [];
      if (titleText) {
        const h = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = titleText;
          h.appendChild(a);
        } else {
          h.textContent = titleText;
        }
        textCell.push(h);
      }
      if (dateText) {
        const p = document.createElement("p");
        p.textContent = dateText;
        textCell.push(p);
      }
      if (href) {
        const cta = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = readText;
        cta.appendChild(a);
        textCell.push(cta);
      }
      if (!img && !textCell.length) return;
      cells.push([img || "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse7(element, { document }) {
    const row = element.querySelector(".row.cmp-columnrow");
    let items = row ? Array.from(row.children).filter((c) => c.classList.contains("cmp-columnrow__item")) : [];
    if (!items.length) {
      items = Array.from(element.querySelectorAll(".cmp-columnrow__item"));
    }
    const cells = [];
    items.forEach((item) => {
      const icon = item.querySelector(".icon .cmp-icon, .icon i, .cmp-icon, .cmp-image img, img, i");
      const textCell = [];
      const nodes = item.querySelectorAll(
        ".cmp-title, .cmp-text, a.cmp-linkcalltoaction, a.cmp-applynowcta, a.btn, a.cmp-link__link"
      );
      const added = [];
      nodes.forEach((node) => {
        if (added.some((s) => s.contains(node))) return;
        added.push(node);
        if (node.matches("a.cmp-link__link") && !node.classList.contains("btn")) {
          const em = document.createElement("em");
          node.replaceWith(em);
          em.append(node);
          textCell.push(em);
        } else {
          textCell.push(node);
        }
      });
      if (!icon && !textCell.length) return;
      cells.push([icon || "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video.js
  function parse8(element, { document }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const toYouTubeUrl = (raw) => {
      if (!raw) return null;
      const url = raw.trim();
      let m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed|v|shorts)\/)([\w-]{6,})/);
      if (m) return `https://www.youtube.com/watch?v=${m[1]}`;
      m = url.match(/[?&]v=([\w-]{6,})/);
      if (m) return `https://www.youtube.com/watch?v=${m[1]}`;
      if (/youtube\.com|youtu\.be/.test(url)) return url;
      return url;
    };
    const addVideo = (raw) => {
      const url = toYouTubeUrl(raw);
      if (!url || seen.has(url)) return;
      seen.add(url);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.textContent = url;
      cells.push([a]);
    };
    element.querySelectorAll("iframe[src]").forEach((f) => {
      const src = f.getAttribute("src") || "";
      if (/youtube|youtu\.be/.test(src)) addVideo(src);
    });
    if (!cells.length) {
      element.querySelectorAll("a[href], [data-video], [data-src], [data-video-id], [data-embed]").forEach((el) => {
        const raw = el.getAttribute("href") || el.getAttribute("data-video") || el.getAttribute("data-src") || el.getAttribute("data-embed") || (el.getAttribute("data-video-id") ? `https://www.youtube.com/watch?v=${el.getAttribute("data-video-id")}` : "");
        if (raw && /youtube|youtu\.be/.test(raw)) addVideo(raw);
      });
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "video", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/fnbo-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "template#speedbump-modal-container",
        ".cmp-experiencefragment--default-zip-code-request-modal",
        ".zipcodeentry",
        // Cookie-consent preferences modal (cmp-cookieconsent__modal)
        ".cmp-cookieconsent",
        ".cmp-cookieconsent__modal",
        // Leave-site interstitial (rendered as .modal.cmp-speedbump)
        ".cmp-speedbump",
        // Existing-customer / product-rate detail / login modals
        ".existingcustomermodal",
        ".cmp-existingcustomermodal",
        ".productratedetailsmodal",
        ".cmp-productratedetailsmodal",
        ".cmp-loginlink",
        // Adobe Audience Manager / demdex ID-sync iframe + retarget pixels
        'iframe[src*="demdex.net"]',
        'iframe[title="Adobe ID Syncing iFrame"]',
        'img[src*="bttrack.com"]',
        'iframe[src*="doubleclick"]'
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        // Sticky navbar header experience-fragment (wrapper + inner XF)
        ".sticky-navbar",
        "#new-page-header",
        // Footer experience-fragment
        "#page-footer",
        // Breadcrumb navigation (product template)
        ".breadcrumbnavigation",
        // Current-zip-code banner (product template)
        ".currentzipcodebanner",
        // Empty script/data containers
        "#soctLinks",
        "#data-product-container",
        // Leftover non-authorable head-ish elements
        "link",
        "meta",
        "noscript",
        "style"
      ]);
    }
  }

  // tools/importer/transformers/fnbo-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/import-personal-banking-product.js
  var parsers = {
    "hero-banner": parse,
    "columns-media": parse2,
    "carousel-feature": parse3,
    "cards-feature": parse4,
    accordion: parse5,
    "cards-article": parse6,
    "cards-product": parse7,
    video: parse8
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "personal-banking-product",
    description: "Personal banking product landing page: full-bleed image page hero with title and CTA, breadcrumb, content sections (feature columns, icon feature grid, FAQ accordion or product cards, video embeds), 4-up financial tips teaser list, and legal disclaimers.",
    urls: [
      "https://www.fnbo.com/personal-banking/checking/free-checking",
      "https://www.fnbo.com/personal-banking/savings"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: [
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagehero.pagesectionwithbackgroundimage.responsivegrid.ss-heroheight-verytall.aem-GridColumn.aem-GridColumn--default--12"
        ]
      },
      {
        name: "columns-media",
        instances: [
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesection.responsivegrid.ss-contentcontainersize-narrow.aem-GridColumn.aem-GridColumn--default--12:not(.ss-pagesectionheight-short):nth-of-type(2)",
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.experiencefragment.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5)",
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundcolor.pagesection.responsivegrid.ss-backgroundcolor-primary.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(7)"
        ]
      },
      {
        name: "carousel-feature",
        instances: [
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundcolor.pagesection.responsivegrid.ss-backgroundcolor-primary.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)"
        ]
      },
      {
        name: "cards-feature",
        instances: [
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesection.responsivegrid.ss-contentcontainersize-narrow.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(4)"
        ]
      },
      {
        name: "accordion",
        instances: [
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesection.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(6) > div.cmp-pagesection > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.accordiongroup.accordion.panelcontainer.aem-GridColumn.aem-GridColumn--default--12"
        ]
      },
      {
        name: "cards-article",
        instances: [
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesection.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(8) > div.cmp-pagesection > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaserlist.ss-presentation-card.ss-layout-4upgrid.aem-GridColumn.aem-GridColumn--default--12",
          "#savingmoneyblogs div.teaserlist"
        ]
      },
      {
        name: "cards-product",
        instances: [
          "#savingssolutions > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.columnrow.aem-GridColumn.aem-GridColumn--default--12",
          "#savingssolutions div.columnrow"
        ]
      },
      {
        name: "video",
        instances: [
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesection.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(6)"
        ]
      },
      {
        name: "section-capable-carousel",
        instances: [
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundcolor.pagesection.responsivegrid.ss-backgroundcolor-primary.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)"
        ],
        section: "brand-green"
      },
      {
        name: "section-gobankingrates",
        instances: [
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.experiencefragment.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5)"
        ],
        section: "highlight"
      },
      {
        name: "section-mobile-banking",
        instances: [
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundcolor.pagesection.responsivegrid.ss-backgroundcolor-primary.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(7)"
        ],
        section: "brand-green"
      },
      {
        name: "section-one-thats-free",
        instances: [
          "#main-content > div.root.responsivegrid > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.pagesectionwithbackgroundcolor.pagesection.responsivegrid.ss-backgroundcolor-primary.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(10)"
        ],
        section: "brand-green"
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      if (blockDef.name.startsWith("section-")) return;
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_personal_banking_product_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_personal_banking_product_exports);
})();

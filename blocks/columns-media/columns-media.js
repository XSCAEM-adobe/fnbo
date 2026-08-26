export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-media-${cols.length}-cols`);

  // Scene7 pads assets onto the requested canvas width, so the DM auto-block's
  // wid=2000 rendition returns a very wide-and-short image (e.g. 2000x334 for a
  // ~319x334 badge). At width:100% that collapses to a thin strip. Drop the wid
  // parameter so Scene7 returns the asset's native (tight-cropped) rendition,
  // preserving its real aspect ratio. Skip the app-store badge list, which is
  // pinned to a fixed 150x45 box via object-fit and handled separately.
  block.querySelectorAll('picture').forEach((pic) => {
    if (pic.closest('ul')) return; // app-store badges — leave as-is
    const stripWid = (url) => url.replace(/([?&])wid=\d+(&|$)/g, (m, pre, post) => (post === '&' ? pre : '')).replace(/[?&]$/, '');
    pic.querySelectorAll('source').forEach((s) => {
      if (s.srcset) s.srcset = stripWid(s.srcset);
    });
    const img = pic.querySelector('img');
    if (img && img.src) img.src = stripWid(img.src);
  });

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const first = col.firstElementChild;
      if (!first) return;

      // pure image column: the only content is a picture/linked image
      const onlyMedia = col.children.length === 1
        && (first.querySelector('picture, img'))
        && first.textContent.trim() === '';
      if (onlyMedia) {
        col.classList.add('columns-media-img-col');
        return;
      }

      // promo column: leads with a standalone image/picture, followed by
      // centered heading + copy (the "YOUR STYLE." card pattern)
      const leadsWithMedia = (first.matches('picture')
        || (first.matches('p') && first.querySelector('picture, img')
          && first.textContent.trim() === ''));
      if (leadsWithMedia) {
        col.classList.add('columns-media-promo-col');
      }
      // otherwise: normal left-aligned text column (no extra class)
    });
  });
}

export default function decorate(block) {
  // Table-authored hero-banner: row 1 = background image (picture), row 2 =
  // heading/subhead/CTAs. EDS wraps the picture in row/cell <div>s, so the
  // picture's containing block becomes the collapsed image-row <div> (height
  // 0) — the CSS `.hero-banner picture { position:absolute; inset:0 }` then
  // resolves against that empty row and the photo never paints. Hoist the
  // picture to be a direct child of the block so its containing block is the
  // band itself, and drop the now-empty image row.
  const picture = block.querySelector('picture');
  if (picture) {
    // The top-level row <div> (direct child of block) that holds the picture.
    const imageRow = [...block.children].find((row) => row.contains(picture));
    block.prepend(picture);
    if (imageRow && imageRow !== picture && imageRow.textContent.trim() === ''
        && !imageRow.querySelector('picture, img')) {
      imageRow.remove();
    }
  }
}

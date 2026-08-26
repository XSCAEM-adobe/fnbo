/*
 * Video Block
 * Shows one or more videos referenced by links.
 * When the block has multiple rows, each row becomes a video that renders
 * side-by-side (3-up on desktop, stacked on mobile).
 * https://www.hlx.live/developer/block-collection/video
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function embedYoutube(url, autoplay, background) {
  const usp = new URLSearchParams(url.search);
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      mute: background ? '1' : '0',
      controls: background ? '0' : '1',
      disablekb: background ? '1' : '0',
      loop: background ? '1' : '0',
      playsinline: background ? '1' : '0',
    };
    suffix = `&${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function embedVimeo(url, autoplay, background) {
  const [, video] = url.pathname.split('/');
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      background: background ? '1' : '0',
    };
    suffix = `?${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function getVideoElement(source, autoplay, background) {
  const video = document.createElement('video');
  video.setAttribute('controls', '');
  if (autoplay) video.setAttribute('autoplay', '');
  if (background) {
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.removeAttribute('controls');
    video.addEventListener('canplay', () => {
      video.muted = true;
      if (autoplay) video.play();
    });
  }

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', `video/${source.split('.').pop()}`);
  video.append(sourceEl);

  return video;
}

const loadVideoEmbed = (container, link, autoplay, background) => {
  if (container.dataset.embedLoaded === 'true') {
    return;
  }
  const url = new URL(link);

  const isYoutube = link.includes('youtube') || link.includes('youtu.be');
  const isVimeo = link.includes('vimeo');

  if (isYoutube) {
    const embedWrapper = embedYoutube(url, autoplay, background);
    container.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      container.dataset.embedLoaded = true;
    });
  } else if (isVimeo) {
    const embedWrapper = embedVimeo(url, autoplay, background);
    container.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      container.dataset.embedLoaded = true;
    });
  } else {
    const videoEl = getVideoElement(link, autoplay, background);
    container.append(videoEl);
    videoEl.addEventListener('canplay', () => {
      container.dataset.embedLoaded = true;
    });
  }
};

export default async function decorate(block) {
  const autoplay = block.classList.contains('autoplay');

  // Collect each authored row as an individual video item.
  const items = [...block.querySelectorAll(':scope > div')]
    .map((row) => {
      const anchor = row.querySelector('a');
      const link = anchor ? anchor.href : null;
      const placeholder = row.querySelector('picture');
      return link ? { link, placeholder } : null;
    })
    .filter(Boolean);

  block.textContent = '';
  block.dataset.embedLoaded = false;

  const videoItems = items.map(({ link, placeholder }) => {
    const item = document.createElement('div');
    item.className = 'video-item';
    item.dataset.embedLoaded = false;

    if (placeholder && !autoplay) {
      item.classList.add('placeholder');
      const wrapper = document.createElement('div');
      wrapper.className = 'video-placeholder';
      wrapper.append(placeholder);
      wrapper.insertAdjacentHTML(
        'beforeend',
        '<div class="video-placeholder-play"><button type="button" title="Play"></button></div>',
      );
      wrapper.addEventListener('click', () => {
        wrapper.remove();
        loadVideoEmbed(item, link, true, false);
      });
      item.append(wrapper);
    }

    block.append(item);
    return { item, link, placeholder };
  });

  // Lazily embed videos that are not click-to-play placeholders.
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      videoItems.forEach(({ item, link, placeholder }) => {
        if (!placeholder || autoplay) {
          const playOnLoad = autoplay && !prefersReducedMotion.matches;
          loadVideoEmbed(item, link, playOnLoad, autoplay);
        }
      });
      block.dataset.embedLoaded = true;
    }
  });
  observer.observe(block);
}

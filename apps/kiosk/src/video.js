// video.js — fullscreen promo video overlay for the kiosk.
// The <video> element lives in document.body so board repaints never detach
// it, and it buffers in the background while the carousel runs. If the file
// fails to load (or takes too long) the overlay simply never appears — the
// carousel behaves as if the feature didn't exist.

const CANPLAY_TIMEOUT_MS = 4000;

let overlay = null;
let video = null;
let videoSrc = '';
let broken = false;
let closeCb = null;
let readyTimer = null;
let cleanReady = null;

function teardown() {
  clearTimeout(readyTimer);
  readyTimer = null;
  cleanReady = null;
  overlay?.remove();
  overlay = null;
  video = null;
  videoSrc = '';
}

function build(src) {
  teardown();
  broken = false;
  overlay = document.createElement('div');
  overlay.className = 'video-overlay';
  overlay.hidden = true;

  video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('aria-hidden', 'true');
  video.src = src;
  videoSrc = src;
  video.addEventListener('error', () => {
    broken = true;
    closeOverlay('unavailable');
  });

  // Mouse-only skip control — the keyboard belongs to the other screen.
  const skip = document.createElement('button');
  skip.type = 'button';
  skip.className = 'video-skip';
  skip.setAttribute('aria-label', 'Cerrar vídeo');
  skip.textContent = '✕';
  skip.addEventListener('click', () => closeOverlay('skip'));

  overlay.append(video, skip);
  document.body.appendChild(overlay);
}

// Creates (or recreates) the buffered video element for the given source.
// Called when entering presentation mode and after config changes.
export function prepareVideo(src) {
  if (!src) {
    teardown();
    broken = false;
    return;
  }
  if (video && videoSrc === src) return; // already buffering this source
  build(src);
}

function beginPlayback() {
  video.currentTime = 0;
  // play() may reject (codec issues) or not exist (jsdom) — a rejected or
  // missing promise means the video can't play here; treat as unavailable.
  const p = video.play?.();
  if (p && typeof p.then === 'function') {
    // Stay hidden until playback actually starts — no black flash on failure.
    p.then(() => {
      overlay.hidden = false;
    }).catch(() => {
      broken = true;
      closeOverlay('unavailable');
    });
  } else {
    closeOverlay('unavailable');
  }
}

// Plays the video fullscreen. If the source isn't buffered yet, waits for
// `canplay` up to CANPLAY_TIMEOUT_MS, then gives up silently.
// onClose(reason) fires with 'ended' | 'skip' | 'unavailable' once playback
// was attempted. Returns false when the video can't even be attempted — no
// callback fires in that case.
export function showVideoOverlay({ src, loop = false, onClose } = {}) {
  if (src) prepareVideo(src);
  if (broken || !video) return false;

  closeCb = onClose ?? null;
  video.loop = loop;
  video.addEventListener('ended', () => closeOverlay('ended'), { once: true });

  if (video.readyState >= 3) {
    beginPlayback();
    return true;
  }

  const cleanup = () => {
    clearTimeout(readyTimer);
    readyTimer = null;
    video.removeEventListener('canplay', onCanPlay);
    video.removeEventListener('error', onError);
    cleanReady = null;
  };
  const onCanPlay = () => {
    cleanup();
    beginPlayback();
  };
  const onError = () => {
    cleanup();
    broken = true;
    closeOverlay('unavailable');
  };
  cleanReady = cleanup;
  video.addEventListener('canplay', onCanPlay);
  video.addEventListener('error', onError);
  readyTimer = setTimeout(() => {
    cleanup();
    closeOverlay('unavailable');
  }, CANPLAY_TIMEOUT_MS);
  return true;
}

function closeOverlay(reason) {
  cleanReady?.();
  cleanReady = null;
  if (video && !video.paused) video.pause();
  if (overlay) overlay.hidden = true;
  const cb = closeCb;
  closeCb = null;
  cb?.(reason);
}

// Teardown path (route changes) — drops the completion callback so it can't
// re-arm the rotation timer after stopPresentation cleared it.
export function hideVideoOverlay() {
  closeCb = null;
  closeOverlay('skip');
}

export function videoIsBroken() {
  return broken;
}

export function videoIsVisible() {
  return Boolean(overlay && !overlay.hidden);
}

export default class PlayerOverlay {
  constructor() {
    this.overlay = null;
    this.container = null;
    this.iframe = null;
    this.cleanup = null;
    this.setup();
  }

  setup() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 bg-black/90 flex items-end sm:items-center justify-center transition-all duration-300 opacity-0 pointer-events-none';
    overlay.innerHTML = `
      <div class="player-wrap w-full sm:max-w-3xl sm:rounded-2xl overflow-hidden bg-black translate-y-8 transition-transform duration-300">
        <div class="flex justify-end p-2">
          <button class="player-close w-8 h-8 flex items-center justify-center text-white/60 hover:text-white text-lg" aria-label="Close player">✕</button>
        </div>
        <div class="player-container relative aspect-video"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.container = overlay.querySelector('.player-container');
    const wrap = overlay.querySelector('.player-wrap');

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    overlay.querySelector('.player-close').addEventListener('click', () => this.close());

    // Swipe down to dismiss
    let startY = 0, currentY = 0, dragging = false;
    const ts = (e) => { startY = e.touches[0].clientY; currentY = startY; dragging = true; wrap.style.transition = 'none'; };
    const tm = (e) => {
      if (!dragging) return;
      currentY = e.touches[0].clientY;
      const d = currentY - startY;
      if (d > 0) {
        wrap.style.transform = 'translateY(' + d + 'px)';
        overlay.style.background = 'rgba(0,0,0,' + Math.max(0, 0.9 - d / window.innerHeight * 0.9) + ')';
      }
    };
    const te = () => {
      if (!dragging) return;
      dragging = false;
      const d = currentY - startY;
      wrap.style.transition = '';
      wrap.style.transform = '';
      overlay.style.background = '';
      if (d > window.innerHeight * 0.3) this.close();
    };
    overlay.addEventListener('touchstart', ts, { passive: true });
    overlay.addEventListener('touchmove', tm, { passive: true });
    overlay.addEventListener('touchend', te);
    this.cleanup = () => {
      overlay.removeEventListener('touchstart', ts);
      overlay.removeEventListener('touchmove', tm);
      overlay.removeEventListener('touchend', te);
      this.cleanup = null;
    };

    // Fullscreen orientation lock
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement && screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      } else if (!document.fullscreenElement && screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    });
  }

  open(videoId) {
    this.container.innerHTML = `<iframe class="absolute inset-0 w-full h-full" src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1" frameborder="0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    this.overlay.classList.remove('opacity-0', 'pointer-events-none');
    this.overlay.querySelector('.player-wrap').classList.remove('translate-y-8');
  }

  close() {
    if (this.cleanup) this.cleanup();
    const wrap = this.overlay.querySelector('.player-wrap');
    wrap.classList.add('translate-y-8');
    this.overlay.classList.add('opacity-0');
    this.overlay.classList.add('pointer-events-none');
    setTimeout(() => { this.container.innerHTML = ''; }, 300);
  }
}

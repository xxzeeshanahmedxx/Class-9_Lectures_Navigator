export default class PlayerOverlay {
  constructor() {
    this.overlay = null;
    this.container = null;
    this.iframe = null;
    this.glow = null;
    this.speedBtn = null;
    this.infoBar = null;
    this.nextUp = null;
    this.fsBtn = null;
    this.isOpen = false;
    this.speeds = [0.5, 1, 1.25, 1.5, 2];
    this.speedIdx = 1;
    this._startY = 0;

    // Only popstate listener in constructor — no DOM until _ensureDOM()
    this._onPopState = (e) => { if (this.isOpen) this._closeInternal(); };
    window.addEventListener('popstate', this._onPopState);
  }

  /* ---- public ---- */

  open(videoId, options = {}) {
    this._ensureDOM();
    history.pushState({ playerOverlay: true }, '');
    this.videoId = videoId;

    // Iframe
    this.iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;

    // Info bar — Subject · Chapter · Title
    if (options.subject || options.chapter || options.title) {
      const parts = [options.subject, options.chapter, options.title].filter(Boolean);
      this.infoBar.textContent = parts.join(' · ');
      this.infoBar.style.display = '';
    } else {
      this.infoBar.style.display = 'none';
    }

    // Next Up
    if (options.nextUp) {
      const link = this.nextUp.querySelector('.nextup-link');
      link.href = options.nextUp.url || '#';
      const thumb = this.nextUp.querySelector('.nextup-thumb');
      thumb.src = `https://img.youtube.com/vi/${options.nextUp.videoId}/mqdefault.jpg`;
      thumb.alt = options.nextUp.title || '';
      this.nextUp.querySelector('.nextup-title').textContent = options.nextUp.title || '';
      this.nextUp.style.display = '';
    } else {
      this.nextUp.style.display = 'none';
    }

    // Ambient glow
    this._setGlow(options.accent || '#8cb4ff');

    // Reset speed to 1x
    this.speedIdx = 1;
    this.speedBtn.textContent = '1x';

    // Animate in
    this.overlay.classList.remove('opacity-0', 'pointer-events-none');
    this.isOpen = true;
    requestAnimationFrame(() => {
      this.container.classList.remove('translate-y-4');
      this.topBar.classList.remove('translate-y-[-8px]', 'opacity-0');
    });
  }

  close() {
    if (history.state?.playerOverlay) {
      history.back();
    } else {
      this._closeInternal();
    }
  }

  /* ---- private ---- */

  _ensureDOM() {
    if (this.overlay) return;

    const overlay = document.createElement('div');
    overlay.className =
      'fixed inset-0 z-50 flex flex-col transition-all duration-250 opacity-0 pointer-events-none';
    overlay.style.background = '#000';
    overlay.innerHTML = `
      <div class="player-topbar flex items-center justify-between px-3 h-11 flex-shrink-0 translate-y-[-8px] opacity-0 transition-all duration-200" style="background: linear-gradient(135deg, rgba(0,0,0,0.97), rgba(10,10,18,0.97)); border-bottom: 1px solid rgba(255,255,255,0.06);">
        <span class="text-[13px] font-medium" style="color: rgba(255,255,255,0.6);">Now playing</span>
        <button class="player-close w-11 h-11 flex items-center justify-center rounded-full active:opacity-50 hover:opacity-80 transition-opacity" style="color: rgba(255,255,255,0.5);" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="flex-1 flex flex-col items-center justify-center p-0 sm:p-4 relative">
        <div class="player-container relative w-full sm:max-w-3xl sm:rounded-xl overflow-hidden aspect-video translate-y-4 transition-all duration-250 bg-black">
          <iframe class="absolute inset-0 w-full h-full" frameborder="0" allow="autoplay; encrypted-media"></iframe>
        </div>
        <div class="player-glow absolute inset-0 pointer-events-none"></div>
        <button class="player-speed absolute bottom-14 right-2 sm:bottom-20 sm:right-5 w-11 h-9 flex items-center justify-center rounded-lg z-10 active:scale-90 hover:scale-105 transition-all font-mono text-xs font-semibold tracking-wider" style="background: rgba(0,0,0,0.6); color: rgba(255,255,255,0.8);" aria-label="Playback speed">1x</button>
        <button class="player-fs absolute bottom-2 right-2 sm:bottom-5 sm:right-5 w-11 h-9 flex items-center justify-center rounded-lg z-10 active:scale-90 hover:scale-105 transition-all" style="background: rgba(0,0,0,0.6); color: rgba(255,255,255,0.8);" aria-label="Fullscreen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
        <div class="player-info w-full sm:max-w-3xl mt-2 px-4 sm:px-0 text-sm" style="color: rgba(255,255,255,0.7); display: none;"></div>
        <div class="player-nextup w-full sm:max-w-3xl mt-3 px-4 sm:px-0" style="display: none;">
          <div class="text-xs font-medium mb-1.5 tracking-wider uppercase" style="color: rgba(255,255,255,0.4);">Next up</div>
          <a class="nextup-link flex items-center gap-3 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors" target="_blank" rel="noopener">
            <img class="nextup-thumb w-20 h-12 rounded object-cover flex-shrink-0 bg-white/10" alt="" loading="lazy" />
            <span class="nextup-title text-sm font-medium leading-snug" style="color: rgba(255,255,255,0.85);"></span>
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.topBar = overlay.querySelector('.player-topbar');
    this.container = overlay.querySelector('.player-container');
    this.iframe = overlay.querySelector('iframe');
    this.glow = overlay.querySelector('.player-glow');
    this.speedBtn = overlay.querySelector('.player-speed');
    this.infoBar = overlay.querySelector('.player-info');
    this.nextUp = overlay.querySelector('.player-nextup');
    this.fsBtn = overlay.querySelector('.player-fs');

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
    overlay.querySelector('.player-close').addEventListener('click', () => this.close());
    this.speedBtn.addEventListener('click', () => this._cycleSpeed());
    this.fsBtn.addEventListener('click', () => this._toggleFS());
    document.addEventListener('fullscreenchange', () => this._onFSChange());

    // Swipe down to close (80px threshold)
    overlay.addEventListener(
      'touchstart',
      (e) => {
        this._startY = e.touches[0].clientY;
      },
      { passive: true }
    );
    overlay.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches[0].clientY - this._startY > 80 && this.isOpen) this.close();
      },
      { passive: true }
    );
  }

  _closeInternal() {
    this.isOpen = false;
    this.topBar.classList.add('translate-y-[-8px]', 'opacity-0');
    this.container.classList.add('translate-y-4');
    this.overlay.classList.add('opacity-0', 'pointer-events-none');
    if (document.fullscreenElement) document.exitFullscreen();
    setTimeout(() => {
      this.iframe.src = '';
    }, 250);
  }

  _setGlow(color) {
    const c = color || '#8cb4ff';
    this.glow.style.background = `radial-gradient(ellipse at center, ${c}33, transparent 70%)`;
  }

  _cycleSpeed() {
    this.speedIdx = (this.speedIdx + 1) % this.speeds.length;
    const speed = this.speeds[this.speedIdx];
    this.speedBtn.textContent = speed + 'x';
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [speed] }),
        '*'
      );
    }
  }

  _toggleFS() {
    const el = this.container;
    if (!document.fullscreenElement) {
      el
        .requestFullscreen({ navigationUI: 'hide' })
        .then(() => {
          screen.orientation?.lock?.('landscape').catch(() => {});
        })
        .catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  _onFSChange() {
    if (!document.fullscreenElement) {
      screen.orientation?.unlock?.();
    }
  }
}

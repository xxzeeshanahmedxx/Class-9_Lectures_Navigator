export default class PlayerOverlay {
  constructor() {
    this.overlay = null;
    this.container = null;
    this.isOpen = false;
    this.setup();
    this._onPopState = (e) => { if (this.isOpen) this._closeInternal(); };
    window.addEventListener('popstate', this._onPopState);
  }

  setup() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 flex flex-col transition-all duration-250 opacity-0 pointer-events-none';
    overlay.style.background = '#000';
    overlay.innerHTML = `
      <div class="flex items-center justify-between px-3 h-11 flex-shrink-0 translate-y-[-8px] opacity-0 transition-all duration-200" style="background: linear-gradient(135deg, rgba(0,0,0,0.97), rgba(10,10,18,0.97)); border-bottom: 1px solid rgba(255,255,255,0.06);">
        <span class="text-[13px] font-medium" style="color: rgba(255,255,255,0.6);">Now playing</span>
        <button class="player-close w-8 h-8 flex items-center justify-center rounded-full active:opacity-50" style="color: rgba(255,255,255,0.5);" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="flex-1 flex items-center justify-center p-0 sm:p-4 relative">
        <div class="player-container relative w-full sm:max-w-3xl sm:rounded-xl overflow-hidden aspect-video translate-y-4 transition-all duration-250" style="background: #000;"></div>
        <button class="player-fs absolute bottom-2 right-2 sm:bottom-5 sm:right-5 w-9 h-9 flex items-center justify-center rounded-lg z-10 active:scale-90" style="background: rgba(0,0,0,0.6); color: rgba(255,255,255,0.8);" aria-label="Fullscreen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.container = overlay.querySelector('.player-container');
    this.topBar = overlay.querySelector('.flex.items-center');
    this.fsBtn = overlay.querySelector('.player-fs');

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
    overlay.querySelector('.player-close').addEventListener('click', () => this.close());
    this.fsBtn.addEventListener('click', () => this.toggleFS());
    document.addEventListener('fullscreenchange', () => this._onFSChange());
  }

  open(videoId) {
    history.pushState({playerOverlay: true}, '');
    this.videoId = videoId;
    this.container.innerHTML = `<iframe class="absolute inset-0 w-full h-full" src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
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

  _closeInternal() {
    this.isOpen = false;
    this.container.classList.add('translate-y-4');
    this.topBar.classList.add('translate-y-[-8px]', 'opacity-0');
    this.overlay.classList.add('opacity-0');
    this.overlay.classList.add('pointer-events-none');
    if (document.fullscreenElement) document.exitFullscreen();
    setTimeout(() => { this.container.innerHTML = ''; }, 250);
  }

  toggleFS() {
    const el = this.container;
    if (!document.fullscreenElement) {
      el.requestFullscreen({navigationUI: 'hide'}).then(() => {
        screen.orientation?.lock?.('landscape').catch(() => {});
      }).catch(() => {});
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

export default class PlayerOverlay {
  constructor() {
    this.overlay = null;
    this.container = null;
    this.setup();
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
      <div class="flex-1 flex items-center justify-center p-0 sm:p-4">
        <div class="player-container relative w-full sm:max-w-3xl sm:rounded-xl overflow-hidden aspect-video translate-y-4 transition-all duration-250" style="background: #000;"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.container = overlay.querySelector('.player-container');
    this.topBar = overlay.querySelector('.flex.items-center');

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
    overlay.querySelector('.player-close').addEventListener('click', () => this.close());
  }

  open(videoId) {
    this.container.innerHTML = `<iframe class="absolute inset-0 w-full h-full" src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1" frameborder="0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    this.overlay.classList.remove('opacity-0', 'pointer-events-none');
    requestAnimationFrame(() => {
      this.container.classList.remove('translate-y-4');
      this.topBar.classList.remove('translate-y-[-8px]', 'opacity-0');
    });
  }

  close() {
    this.container.classList.add('translate-y-4');
    this.topBar.classList.add('translate-y-[-8px]', 'opacity-0');
    this.overlay.classList.add('opacity-0');
    this.overlay.classList.add('pointer-events-none');
    setTimeout(() => { this.container.innerHTML = ''; }, 250);
  }
}

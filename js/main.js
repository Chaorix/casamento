/* =============================================
   MAHIANE & MATEUS — WEDDING RSVP
   main.js
   =============================================

   IMPORTANT: This file uses placeholder tokens that
   are replaced by GitHub Actions before deployment.
   Do NOT hard-code real keys here.

   Secrets injected:
     __SUPABASE_URL__      → SUPABASE_URL secret
     __SUPABASE_ANON_KEY__ → SUPABASE_ANON_KEY secret
============================================= */

'use strict';

// ─── SUPABASE CONFIG ─────────────────────────────────────────────────────────
// NOTE: Initialized lazily on first insert to avoid crashing the entire script
// when the placeholder tokens haven't been replaced yet (e.g. local preview).
const SUPABASE_URL      = '__SUPABASE_URL__';
const SUPABASE_ANON_KEY = '__SUPABASE_ANON_KEY__';

let _dbClient = null;
function getDb() {
  if (_dbClient) return _dbClient;
  try {
    _dbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn('[RSVP] Supabase not initialized (keys not injected yet):', e.message);
  }
  return _dbClient;
}

// ─── CAROUSEL ────────────────────────────────────────────────────────────────
(function initCarousel() {
  const track       = document.getElementById('carousel-track');
  const slides      = document.querySelectorAll('.carousel-slide');
  const dotsWrapper = document.getElementById('carousel-dots');
  const prevBtn     = document.getElementById('carousel-prev');
  const nextBtn     = document.getElementById('carousel-next');

  if (!track || !slides.length) return;

  const total = slides.length;
  let current = 0;
  let autoPlay = null;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Foto ${i + 1} de ${total}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsWrapper.appendChild(dot);
  });

  function updateDots() {
    dotsWrapper.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      const isActive = i === current;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function goTo(n) {
    current = ((n % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoPlay() {
    autoPlay = setInterval(next, 4500);
  }

  function resetAutoPlay() {
    clearInterval(autoPlay);
    startAutoPlay();
  }

  prevBtn.addEventListener('click', () => { prev(); resetAutoPlay(); });
  nextBtn.addEventListener('click', () => { next(); resetAutoPlay(); });

  // Touch / swipe support
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging  = false;

  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 40 && dy < 60) {
      dx > 0 ? next() : prev();
      resetAutoPlay();
    }
    isDragging = false;
  }, { passive: true });

  // Keyboard navigation when carousel is focused
  document.getElementById('main-carousel').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); resetAutoPlay(); }
    if (e.key === 'ArrowRight') { next(); resetAutoPlay(); }
  });

  startAutoPlay();
})();


// ─── SCROLL ANIMATIONS ───────────────────────────────────────────────────────
(function initScrollAnimations() {
  const opts = { threshold: 0.18, rootMargin: '0px 0px -40px 0px' };

  const observerCards = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observerCards.unobserve(entry.target);
      }
    });
  }, opts);

  document.querySelectorAll('[data-animate]').forEach(el => observerCards.observe(el));

  const observerLeft = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observerLeft.unobserve(entry.target);
      }
    });
  }, opts);

  document.querySelectorAll('[data-animate-left]').forEach(el => observerLeft.observe(el));

  const observerRight = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observerRight.unobserve(entry.target);
      }
    });
  }, opts);

  document.querySelectorAll('[data-animate-right]').forEach(el => observerRight.observe(el));
})();


// ─── MODAL ───────────────────────────────────────────────────────────────────
(function initModal() {
  const overlay      = document.getElementById('modal-overlay');
  const closeBtn     = document.getElementById('modal-close');
  const rsvpBtn      = document.getElementById('rsvp-btn');
  const guestList    = document.getElementById('guest-list');
  const addGuestBtn  = document.getElementById('add-guest-btn');
  const errorMsg     = document.getElementById('error-name');

  // Step buttons
  const step1Next    = document.getElementById('step1-next');
  const step2Back    = document.getElementById('step2-back');
  const step2Confirm = document.getElementById('step2-confirm');

  // Progress dots
  const progs = [
    document.getElementById('prog-1'),
    document.getElementById('prog-2'),
    document.getElementById('prog-3'),
  ];

  let guestCount = 1; // tracks highest guest index for unique IDs
  let currentStep = 1;

  // ── Open / Close ──────────────────────────────────────────────────────────
  function openModal() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    // Focus first input after transition
    setTimeout(() => {
      const firstInput = document.getElementById('guest-input-0');
      if (firstInput) firstInput.focus();
    }, 350);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    // Reset after transition
    setTimeout(resetModal, 380);
  }

  rsvpBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });

  // ── Progress dots ─────────────────────────────────────────────────────────
  function updateProgress(step) {
    progs.forEach((dot, i) => {
      dot.classList.remove('active', 'done');
      if (i + 1 < step)  dot.classList.add('done');
      if (i + 1 === step) dot.classList.add('active');
    });
  }

  // ── Step navigation ───────────────────────────────────────────────────────
  function goToStep(n) {
    document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step-${n}`).classList.add('active');
    currentStep = n;
    updateProgress(n);
  }

  // ── Guest management ──────────────────────────────────────────────────────
  function getGuestValues() {
    return [...document.querySelectorAll('.guest-input')]
      .map(i => i.value.trim())
      .filter(v => v.length > 0);
  }

  function addGuestRow() {
    guestCount++;
    const idx = guestCount;
    const row = document.createElement('div');
    row.className = 'guest-row';
    row.id = `guest-row-${idx}`;
    row.innerHTML = `
      <input
        class="guest-input"
        id="guest-input-${idx}"
        type="text"
        placeholder="Nome do acompanhante"
        autocomplete="off"
        aria-label="Nome do acompanhante ${idx}"
      />
      <button class="btn-remove" aria-label="Remover acompanhante">&#215;</button>
    `;
    row.querySelector('.btn-remove').addEventListener('click', () => {
      row.remove();
    });
    guestList.appendChild(row);
    document.getElementById(`guest-input-${idx}`).focus();
  }

  addGuestBtn.addEventListener('click', addGuestRow);

  // ── Step 1 → Step 2 ───────────────────────────────────────────────────────
  step1Next.addEventListener('click', () => {
    const guests = getGuestValues();

    // Validation
    const firstInput = document.getElementById('guest-input-0');
    if (!firstInput.value.trim()) {
      firstInput.classList.add('input-error');
      errorMsg.classList.add('visible');
      firstInput.focus();
      firstInput.addEventListener('input', () => {
        firstInput.classList.remove('input-error');
        errorMsg.classList.remove('visible');
      }, { once: true });
      return;
    }

    // Populate summary
    const summaryGuests = document.getElementById('summary-guests');
    summaryGuests.innerHTML = guests
      .map(name => `<span class="guest-chip"><i data-lucide="user"></i> ${escapeHtml(name)}</span>`)
      .join('');

    // Render lucide icons inserted dynamically
    lucide.createIcons();

    goToStep(2);
  });

  // ── Step 2 → Step 1 (back) ────────────────────────────────────────────────
  step2Back.addEventListener('click', () => goToStep(1));

  // ── Step 2 → Step 3 (confirm + Supabase insert) ───────────────────────────
  step2Confirm.addEventListener('click', async () => {
    const guests = getGuestValues();
    const confirmBtn = step2Confirm;

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Confirmando…';

    try {
      const client = getDb();

      if (!client) {
        throw new Error('Supabase não inicializado. Verifique as configurações.');
      }

      const { error } = await client.from('confirmations').insert({
        guest_name:        guests[0],
        additional_guests: guests.slice(1),
        total_guests:      guests.length,
        confirmed_at:      new Date().toISOString(),
      });

      if (error) throw error;

      // ✅ Só chega aqui se o insert foi bem-sucedido
      goToStep(3);
      triggerConfetti();

      // Auto-close after 4 seconds
      setTimeout(closeModal, 4200);

    } catch (err) {
      console.error('[RSVP] Supabase insert error:', err);
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirmar ✓';

      showToast('Ocorreu um erro ao confirmar. Tente novamente.', 'error');
    }
  });

  // ── Reset modal to initial state ──────────────────────────────────────────
  function resetModal() {
    goToStep(1);

    // Restore guest list to single row
    guestList.innerHTML = `
      <div class="guest-row" id="guest-row-0">
        <input
          class="guest-input"
          id="guest-input-0"
          type="text"
          placeholder="Seu nome completo"
          autocomplete="name"
          aria-label="Seu nome completo"
        />
      </div>
    `;
    guestCount = 1;
    errorMsg.classList.remove('visible');

    // Restore confirm button
    step2Confirm.disabled = false;
    step2Confirm.textContent = 'Confirmar ✓';
  }
})();


// ─── CONFETTI ────────────────────────────────────────────────────────────────
function triggerConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = ''; // clear any old pieces

  const colors = [
    '#60A5FA', '#93C5FD', '#BAE6FD',
    '#C4A35A', '#EDD9A3', '#FFFFFF',
    '#3B82F6', '#7DD3FC',
  ];

  const shapes = ['2px', '50%']; // rectangle or circle

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    const size   = 6 + Math.random() * 8;
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const shape  = shapes[Math.floor(Math.random() * shapes.length)];
    const left   = Math.random() * 100;
    const delay  = Math.random() * 0.8;
    const dur    = 1.8 + Math.random() * 1.6;

    piece.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size * (0.5 + Math.random())}px;
      background: ${color};
      border-radius: ${shape};
      animation-delay: ${delay}s;
      animation-duration: ${dur}s;
    `;
    container.appendChild(piece);
  }

  // Clean up after animation
  setTimeout(() => { container.innerHTML = ''; }, 4000);
}


// ─── TOAST NOTIFICATION ──────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.setAttribute('role', 'alert');
  toast.textContent = message;

  const bgColor = type === 'error' ? '#dc2626' : '#2563EB';
  toast.style.cssText = `
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${bgColor};
    color: white;
    padding: 14px 28px;
    border-radius: 60px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    z-index: 9998;
    transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
    opacity: 0;
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(12px)';
    setTimeout(() => toast.remove(), 380);
  }, 3500);
}


// ─── UTILITIES ───────────────────────────────────────────────────────────────
function escapeHtml(str) {
  const map = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

// ─── LUCIDE ICONS INIT ───────────────────────────────────────────────────────
// Renders all static <i data-lucide="..."> elements in the HTML
lucide.createIcons();

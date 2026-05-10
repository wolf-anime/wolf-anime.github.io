/* ===== WOLF ANIME — app.js ===== */

/* ---- Navbar scroll effect ---- */
const navbar = document.getElementById('navbar');
const onScroll = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
};
window.addEventListener('scroll', onScroll, { passive: true });

/* ---- Mobile lateral menu ---- */
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');
const navOverlay = document.getElementById('nav-overlay');

const toggleMenu = () => {
  navMenu?.classList.toggle('open');
  navOverlay?.classList.toggle('open');
  document.body.style.overflow = navMenu?.classList.contains('open') ? 'hidden' : '';
};

navToggle?.addEventListener('click', toggleMenu);
navOverlay?.addEventListener('click', toggleMenu);

// Close on link click
navMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ---- Counter animation ---- */
const counters = document.querySelectorAll('.stat__number[data-target]');

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;

  const update = () => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString();
    if (current < target) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(el => counterObserver.observe(el));

/* ---- Scroll-reveal animation ---- */
const animateEls = document.querySelectorAll('[data-animate]');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger effect for siblings
      const siblings = entry.target.parentElement
        ? [...entry.target.parentElement.children].filter(c => c.hasAttribute('data-animate'))
        : [];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

animateEls.forEach(el => revealObserver.observe(el));

/* ---- Screenshots carousel & Lightbox ---- */
(function () {
  const track = document.getElementById('screenshots-track');
  const dots  = document.querySelectorAll('.ss-dot');
  const wrapper = track?.parentElement;
  if (!track || !wrapper) return;

  const items = track.querySelectorAll('.screenshot-item');
  let current = 0;
  let isDragging = false;
  let startX = 0;

  function getItemWidth() {
    const item = items[0];
    if (!item) return 0;
    const style = window.getComputedStyle(item);
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    return item.offsetWidth + gap;
  }

  // Adjust max index based on items per view (approx 3 on desktop, 1 on mobile)
  function getMaxIndex() {
    const isMobile = window.innerWidth <= 768;
    return isMobile ? items.length - 1 : Math.max(0, items.length - 3);
  }

  function goTo(idx) {
    const maxIdx = getMaxIndex();
    current = Math.max(0, Math.min(idx, maxIdx));
    const offset = current * getItemWidth();
    track.style.transform = `translateX(-${offset}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.idx)));
  });

  // Drag / swipe
  let moved = false;
  wrapper.addEventListener('pointerdown', e => {
    isDragging = true;
    startX = e.clientX;
    moved = false;
    track.style.transition = 'none';
  });

  window.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 5) {
      moved = true;
      track.style.transform = `translateX(${-current * getItemWidth() + delta}px)`;
    }
  });

  window.addEventListener('pointerup', e => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
    const delta = e.clientX - startX;
    if (moved && Math.abs(delta) > 40) {
      goTo(delta < 0 ? current + 1 : current - 1);
    } else {
      goTo(current);
    }
  });

  window.addEventListener('pointercancel', () => {
    isDragging = false;
    track.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
    goTo(current);
  });

  window.addEventListener('resize', () => {
    track.style.transition = 'none';
    goTo(current);
    setTimeout(() => {
      track.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
    }, 50);
  });

  /* Lightbox feature with navigation */
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  document.body.appendChild(lightbox);
  
  const lbImg = document.createElement('img');
  lightbox.appendChild(lbImg);

  const lbPrev = document.createElement('button');
  lbPrev.className = 'lightbox__nav lightbox__nav--prev';
  lbPrev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  lightbox.appendChild(lbPrev);

  const lbNext = document.createElement('button');
  lbNext.className = 'lightbox__nav lightbox__nav--next';
  lbNext.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  lightbox.appendChild(lbNext);

  const lbClose = document.createElement('button');
  lbClose.className = 'lightbox__close';
  lbClose.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  lightbox.appendChild(lbClose);

  let allImages = [];
  let currentLbIdx = 0;

  function updateLightbox() {
    lbImg.src = allImages[currentLbIdx].src;
  }

  function showNext() {
    currentLbIdx = (currentLbIdx + 1) % allImages.length;
    updateLightbox();
  }

  function showPrev() {
    currentLbIdx = (currentLbIdx - 1 + allImages.length) % allImages.length;
    updateLightbox();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  lbNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

  lightbox.addEventListener('click', (e) => {
    if (e.target !== lbImg && !e.target.closest('.lightbox__nav')) closeLightbox();
  });

  function initLightbox() {
    allImages = [...document.querySelectorAll('.screenshot-frame--photo img')];
    allImages.forEach((img, idx) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        currentLbIdx = idx;
        updateLightbox();
        lightbox.classList.add('active');
      });
    });
  }

  initLightbox();

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

})();

/* ---- Particles Canvas ---- */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.5 + 0.1,
    };
  }

  function init() {
    resize();
    const COUNT = Math.min(Math.floor((W * H) / 14000), 120);
    particles = Array.from({ length: COUNT }, randomParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 136, ${p.opacity})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();

/* ---- Smooth download button animation (solo Android) ---- */
const btnAndroid = document.getElementById('btn-android');
if (btnAndroid) {
  btnAndroid.addEventListener('click', e => {
    e.preventDefault();
    const originalText = btnAndroid.innerHTML;
    btnAndroid.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="animation:spin 1s linear infinite"><path d="M12 4V2A10 10 0 002 12h2a8 8 0 018-8z"/></svg> Preparando...`;
    setTimeout(() => {
      btnAndroid.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> ¡Descarga lista!`;
      setTimeout(() => { btnAndroid.innerHTML = originalText; }, 2500);
    }, 1800);
  });
}

/* Spin keyframe */
const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(style);

/* ---- Modal System Logic ---- */
const modalOverlay = document.getElementById('modal-overlay');
const modalTriggers = document.querySelectorAll('[data-modal]');
const modalCloseBtns = document.querySelectorAll('.modal__close');
const allModals = document.querySelectorAll('.modal');

const openModal = (modalId) => {
  const targetModal = document.getElementById(modalId);
  if (!targetModal) return;

  modalOverlay.classList.add('active');
  targetModal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

const closeAllModals = () => {
  modalOverlay.classList.remove('active');
  allModals.forEach(m => m.classList.remove('active'));
  document.body.style.overflow = '';
};

modalTriggers.forEach(trigger => {
  trigger.addEventListener('click', () => {
    const modalId = trigger.getAttribute('data-modal');
    openModal(modalId);
  });
});

modalCloseBtns.forEach(btn => {
  btn.addEventListener('click', closeAllModals);
});

modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeAllModals();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay?.classList.contains('active')) {
    closeAllModals();
  }
});

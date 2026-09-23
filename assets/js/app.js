// ==========================================================================
// FELIX AUTOMOTIVE BATTERIES — HIGH PERFORMANCE MOTION & APP CONTROLLER
// Powered by Lenis Smooth Momentum Scrolling, GSAP 3 & ScrollTrigger
// ==========================================================================

let lenis = null;

// ==========================================================================
// 0. Device & Capability Helpers (mobile-first guards)
// ==========================================================================
const MQ_TOUCH = window.matchMedia('(hover: none) and (pointer: coarse)');
const MQ_MOBILE = window.matchMedia('(max-width: 768px)');
const MQ_TABLET = window.matchMedia('(max-width: 992px)');
const MQ_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

const isTouch = () => MQ_TOUCH.matches;
const isMobile = () => MQ_MOBILE.matches;
const isTablet = () => MQ_TABLET.matches;
const prefersReducedMotion = () => MQ_REDUCED.matches;
// Heavy continuous effects (canvas particles, smooth-scroll hijacking, 3D tilt)
// are skipped on touch/handheld hardware where they cost battery and jank.
const allowHeavyMotion = () => !isTablet() && !isTouch() && !prefersReducedMotion();

// Single rAF-throttled scroll dispatcher — replaces multiple raw scroll listeners
const scrollSubscribers = [];
let scrollTicking = false;
function onScrollThrottled(fn) {
  scrollSubscribers.push(fn);
  fn();
}
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    scrollSubscribers.forEach(fn => fn());
    scrollTicking = false;
  });
}, { passive: true });

function debounce(fn, wait = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Real viewport unit for mobile browsers whose address bar changes 100vh
function setViewportUnit() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
setViewportUnit();
window.addEventListener('resize', debounce(setViewportUnit, 120), { passive: true });
window.addEventListener('orientationchange', () => setTimeout(setViewportUnit, 250));

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initCustomCursor();
  initHeroEnergyCanvas();
  initHeroAntigravityMotion();
  initEnergySectionMotion();
  initShowcaseScroll();
  initAutomotiveSectionMotion();
  initProductDetailConnectors();
  initExplodedCutawayMotion();
  initPerformanceCounters();
  initApplicationsAndManufacturingMotion();
  initReviewsFilter();
  initBatteryFinder();
  initLoadCalculator();
  initModals();
  initMobileNav();
  initScrollProgressBar();
  initBackToTop();
  initContactForm();
  initScrollTriggerRefresh();
});

// ==========================================================================
// 0b. ScrollTrigger position refresh
// Reveal animations are `gsap.from()` tweens, so their start state is
// opacity 0. ScrollTrigger measures trigger positions once at init — before
// images and webfonts have loaded. On mobile those assets change the page
// height by thousands of pixels, the cached positions go stale, and whole
// sections (Why Felix, Applications, Manufacturing, Testimonials) stay
// stuck at opacity 0 because their trigger never resolves correctly.
// ==========================================================================
function initScrollTriggerRefresh() {
  if (typeof ScrollTrigger === 'undefined') return;

  const refresh = () => ScrollTrigger.refresh();

  window.addEventListener('load', refresh);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refresh).catch(() => {});
  }

  // Lazy images resolve well after load; each one that lands shifts layout.
  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  const debouncedRefresh = debounce(refresh, 250);
  lazyImgs.forEach(img => {
    if (img.complete) return;
    img.addEventListener('load', debouncedRefresh, { once: true });
    img.addEventListener('error', debouncedRefresh, { once: true });
  });

  // Orientation changes and address-bar resizes invalidate every measurement
  window.addEventListener('orientationchange', () => setTimeout(refresh, 320));

  let lastW = window.innerWidth;
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    refresh();
  }, 220), { passive: true });

  // Final safety net for slow connections
  setTimeout(refresh, 1200);
  setTimeout(refresh, 3000);
}

// ==========================================================================
// 0c. Safe scroll reveal
// `gsap.from()` writes its start state (opacity 0) to the element straight
// away and leans on the trigger to undo it. If the trigger is stranded — a
// ScrollTrigger.refresh() after the tween has completed reverts it without
// replaying, which is what mobile's lazy images and address-bar resizes
// cause — the content stays invisible forever.
//
// revealOnScroll() uses fromTo with immediateRender:false instead, so the
// element renders at its natural CSS until the tween actually runs. The worst
// case becomes "content appears without animating" rather than "content is
// never shown".
// ==========================================================================
function revealOnScroll(targets, fromVars, opts = {}) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return null;

  const list = typeof targets === 'string' ? document.querySelectorAll(targets) : targets;
  if (!list || (list.length !== undefined && list.length === 0)) return null;

  const { trigger, start = 'top 80%', stagger, duration = 0.65, ease = 'power2.out', delay } = opts;

  return gsap.fromTo(targets, fromVars, {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    duration,
    ease,
    stagger,
    delay,
    immediateRender: false,
    overwrite: 'auto',
    scrollTrigger: {
      trigger: trigger || targets,
      start,
      // Deliberately no 'reverse': re-hiding content the reader has already
      // scrolled past buys nothing and is the state that gets stranded.
      toggleActions: 'play none none none',
      once: true,
      invalidateOnRefresh: true
    }
  });
}

// ==========================================================================
// 1. Lenis Smooth Momentum Scrolling
// ==========================================================================
function initLenis() {
  // Touch devices keep native momentum scrolling: Lenis fights the OS scroller,
  // breaks address-bar collapse and adds constant rAF work on mobile.
  if (typeof Lenis === 'undefined' || isTouch() || isMobile() || prefersReducedMotion()) {
    initNativeAnchorScroll();
    return;
  }

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.8,
  });

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Smooth anchor links with Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetEl, { offset: -60, duration: 1.4 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });
}

// Native smooth anchor scrolling (used whenever Lenis is disabled, e.g. mobile)
function initNativeAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const header = document.getElementById('navbarMain');
      const offset = header ? header.offsetHeight + 8 : 60;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  });
}

// ==========================================================================
// 2. Custom Magnetic Desktop Cursor
// ==========================================================================
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  // Disable on touch devices
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  function renderFollower() {
    followerX += (mouseX - followerX) * 0.16;
    followerY += (mouseY - followerY) * 0.16;
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    requestAnimationFrame(renderFollower);
  }
  requestAnimationFrame(renderFollower);

  // Hover states on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, .drive-card, .showcase-product-card, .app-card, .benefit-card, .timeline-step-card, .telemetry-card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.classList.add('cursor-hover');
      if (el.classList.contains('drive-card') || el.classList.contains('app-card')) {
        follower.classList.add('cursor-view');
      }
    });
    el.addEventListener('mouseleave', () => {
      follower.classList.remove('cursor-hover');
      follower.classList.remove('cursor-view');
    });
  });
}

// ==========================================================================
// 3. Hero Energy Canvas (Particles & Dynamic Field Lines)
// ==========================================================================
function initHeroEnergyCanvas() {
  const canvas = document.getElementById('heroEnergyCanvas');
  if (!canvas) return;

  // The particle field is decorative. On phones and reduced-motion setups it is
  // pure battery cost, so the canvas is removed from the paint path entirely.
  if (isMobile() || prefersReducedMotion()) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let particles = [];
  let rafId = null;
  let visible = true;

  function sizeCanvas() {
    if (!canvas.parentElement) return;
    width = canvas.parentElement.offsetWidth;
    height = canvas.parentElement.offsetHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildParticles() {
    // Scale the field down on narrower/lower-power screens: the link pass is O(n^2).
    const cap = isTablet() ? 20 : 42;
    const count = Math.max(10, Math.min(Math.floor(width / 34), cap));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.2 + 1,
        alpha: Math.random() * 0.5 + 0.25
      });
    }
  }

  sizeCanvas();
  buildParticles();

  window.addEventListener('resize', debounce(() => {
    sizeCanvas();
    buildParticles();
  }, 200), { passive: true });

  const LINK_DIST = 130;
  const LINK_DIST_SQ = LINK_DIST * LINK_DIST;

  function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < LINK_DIST_SQ) {
          const opacity = (1 - Math.sqrt(distSq) / LINK_DIST) * 0.18;
          ctx.strokeStyle = `rgba(0, 184, 63, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00B83F';
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.fillStyle = `rgba(0, 184, 63, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    rafId = requestAnimationFrame(draw);
  }

  function start() {
    if (rafId === null) rafId = requestAnimationFrame(draw);
  }
  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Stop painting once the hero scrolls away or the tab is backgrounded.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    }, { threshold: 0 }).observe(canvas);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !visible) stop();
    else start();
  });

  start();
}

// ==========================================================================
// 4. Hero Antigravity Motion (GSAP & ScrollTrigger)
// ==========================================================================
function initHeroAntigravityMotion() {
  const heroStage = document.getElementById('heroAntigravityStage');
  const heroBattery = document.getElementById('heroBatteryWrapper');
  const tiltEl = document.getElementById('heroBatteryTilt');
  const floatingTags = document.querySelectorAll('.hero-floating-tag');

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero Battery 3D Upward Levitation & Dynamic Parallax Scrub
  if (heroBattery) {
    gsap.to(heroBattery, {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2
      },
      y: -110,
      rotationZ: 5,
      rotationY: -8,
      scale: 1.05,
      ease: 'power1.out'
    });
  }

  // 3D Perspective Tilt on Mousemove (Using GSAP quickTo - Zero Conflict with Scroll)
  // Pointer-driven only: on touch there is no hover, so the listener is dead weight.
  if (heroStage && tiltEl && !isTouch()) {
    const xTo = gsap.quickTo(tiltEl, 'rotationY', { duration: 0.5, ease: 'power2.out' });
    const yTo = gsap.quickTo(tiltEl, 'rotationX', { duration: 0.5, ease: 'power2.out' });

    heroStage.addEventListener('mousemove', (e) => {
      const rect = heroStage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      xTo(x * 22);
      yTo(-y * 22);
    });

    heroStage.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  }

  // Independent multi-speed parallax on floating technical labels
  // Uses a wrapper approach: GSAP scroll acts on the tag's BASE position, idle float adds a separate y animation
  floatingTags.forEach((tag, idx) => {
    const speed = parseFloat(tag.dataset.speed) || 0.4;

    // Scroll parallax (acts on the wrapper, independent of idle float)
    gsap.to(tag, {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.4
      },
      y: -130 * speed,
      opacity: 0,
      ease: 'power1.out'
    });

    // Gentle idle floating oscillation — uses yoyoEase so it never resets awkwardly
    gsap.fromTo(tag,
      { y: 0 },
      {
        y: 8,
        duration: 2.2 + idx * 0.35,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: idx * 0.3
      }
    );
  });

  // Hero Content Entrance Animation — runs on page load, separate from scroll triggers
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
  heroTl
    .from('.hero-eyebrow-pill', { y: 28, opacity: 0, duration: 0.65 })
    .from('.hero-headline', { y: 42, opacity: 0, duration: 0.85 }, '-=0.45')
    .from('.hero-subheadline', { y: 28, opacity: 0, duration: 0.7 }, '-=0.5')
    .from('.hero-cta-row', { y: 22, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero-metrics-strip > div', { y: 18, opacity: 0, stagger: 0.12, duration: 0.55 }, '-=0.35')
    .from('.hero-floating-tag', { scale: 0.8, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(1.5)' }, '-=0.55')
    .from(heroBattery, { scale: 0.85, opacity: 0, y: 30, duration: 1.1, ease: 'power2.out' }, '-=0.9');
}

// ==========================================================================
// 5. Energy Section Motion (Vector Energy Flow & Telemetry Cards)
// ==========================================================================
function initEnergySectionMotion() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Animated SVG Energy Stream Paths
  const paths = document.querySelectorAll('.energy-line-path');
  paths.forEach((path) => {
    try {
      const length = path.getTotalLength ? path.getTotalLength() : 380;
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(path, {
        scrollTrigger: {
          trigger: '#energy',
          start: 'top 70%',
          end: 'top 20%',
          scrub: 1
        },
        strokeDashoffset: 0,
        ease: 'power2.out'
      });
    } catch (e) {
      // Fallback if SVG length calculation is unsupported
    }
  });

  // Telemetry Cards Parallax Entrance
  gsap.utils.toArray('.telemetry-card').forEach((card, idx) => {
    revealOnScroll(card, { y: 45 + idx * 25, opacity: 0, scale: 0.94 },
      { trigger: '#energy', start: 'top 75%', duration: 0.8, delay: idx * 0.15, ease: 'back.out(1.4)' });
  });

  // Central Battery Node Floating Pulse
  const centralNode = document.querySelector('.central-battery-node');
  if (centralNode) {
    gsap.to(centralNode, {
      scrollTrigger: {
        trigger: '#energy',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      },
      y: -25,
      scale: 1.04,
      ease: 'power1.out'
    });
  }
}

// ==========================================================================
// 6. Product Showcase Horizontal Scroll Experience
// ==========================================================================
function initShowcaseScroll() {
  const wrap = document.getElementById('showcaseHorizontalWrap');
  const track = document.getElementById('showcaseHorizontalTrack');
  const progressBar = document.getElementById('showcaseProgressBar');
  const counterEl = document.getElementById('showcaseCounter');
  const prevBtn = document.getElementById('showcasePrevBtn');
  const nextBtn = document.getElementById('showcaseNextBtn');
  const cards = document.querySelectorAll('.showcase-product-card');
  if (!wrap || !track || !cards.length) return;

  let showcaseTween = null;

  // Measured card pitch (width + gap) so the counter and arrows stay accurate
  // across the fluid mobile card widths.
  function cardStep() {
    if (cards.length > 1) {
      const a = cards[0].getBoundingClientRect();
      const b = cards[1].getBoundingClientRect();
      const step = b.left - a.left;
      if (step > 0) return step;
    }
    return cards[0] ? cards[0].getBoundingClientRect().width + 16 : 340;
  }

  function setupDesktopPin() {
    if (window.innerWidth > 992 && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 80);

      showcaseTween = gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: '#showcase',
          start: 'top 60px',
          end: () => `+=${Math.max(track.scrollWidth - window.innerWidth + 400, 600)}`,
          pin: true,
          scrub: 1.1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressBar) {
              const pct = 16.66 + self.progress * (100 - 16.66);
              progressBar.style.width = `${pct}%`;
            }
            if (counterEl) {
              const cardIdx = Math.min(Math.floor(self.progress * cards.length) + 1, cards.length);
              counterEl.textContent = `${cardIdx} / ${cards.length}`;
            }
          }
        }
      });
    } else {
      // Mobile & Tablet: Native horizontal touch scrolling with snap
      wrap.addEventListener('scroll', () => {
        const scrollLeft = wrap.scrollLeft;
        const maxScroll = wrap.scrollWidth - wrap.clientWidth;
        if (maxScroll > 0 && progressBar) {
          const pct = (scrollLeft / maxScroll) * 100;
          progressBar.style.width = `${Math.max(pct, 16.66)}%`;
        }
        if (counterEl && maxScroll > 0) {
          // Map scroll progress across the range so the last card always reads
          // as the last index — the track's max scroll stops short of a full
          // card pitch, which an offset-based count rounds down.
          const progress = scrollLeft / maxScroll;
          const cardIdx = Math.min(Math.round(progress * (cards.length - 1)) + 1, cards.length);
          counterEl.textContent = `${cardIdx} / ${cards.length}`;
        }
      }, { passive: true });
    }
  }

  setupDesktopPin();

  // Only rebuild on a real width change: mobile browsers fire resize constantly
  // as the address bar collapses, which would thrash the pinned timeline.
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    if (showcaseTween && showcaseTween.scrollTrigger) {
      showcaseTween.scrollTrigger.kill();
      showcaseTween.kill();
      showcaseTween = null;
      gsap.set(track, { clearProps: 'all' });
      setupDesktopPin();
    }
  }, 200), { passive: true });

  // Prev / Next button navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (showcaseTween && showcaseTween.scrollTrigger) {
        const st = showcaseTween.scrollTrigger;
        const curProgress = st.progress;
        const step = 1 / (cards.length - 1);
        const newProgress = Math.max(0, curProgress - step);
        const targetScroll = st.start + newProgress * (st.end - st.start);
        if (lenis) lenis.scrollTo(targetScroll, { duration: 0.8 });
        else window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      } else {
        wrap.scrollBy({ left: -cardStep(), behavior: 'smooth' });
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (showcaseTween && showcaseTween.scrollTrigger) {
        const st = showcaseTween.scrollTrigger;
        const curProgress = st.progress;
        const step = 1 / (cards.length - 1);
        const newProgress = Math.min(1, curProgress + step);
        const targetScroll = st.start + newProgress * (st.end - st.start);
        if (lenis) lenis.scrollTo(targetScroll, { duration: 0.8 });
        else window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      } else {
        wrap.scrollBy({ left: cardStep(), behavior: 'smooth' });
      }
    });
  }

  // Floating hover physics for battery cards (pointer devices only)
  if (!isTouch()) cards.forEach(card => {
    const img = card.querySelector('.showcase-product-img');
    if (!img) return;

    card.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(img, { y: -12, scale: 1.05, duration: 0.4, ease: 'power2.out' });
      }
    });
    card.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(img, { y: 0, scale: 1, duration: 0.5, ease: 'power2.out' });
      }
    });
  });
}

// ==========================================================================
// 7. Automotive Drive Categories Motion
// ==========================================================================
function initAutomotiveSectionMotion() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.utils.toArray('.drive-card').forEach((card, idx) => {
    revealOnScroll(card, { y: 40, opacity: 0 },
      { trigger: '#automotive', start: 'top 78%', duration: 0.65, delay: idx * 0.08 });
  });
}

// ==========================================================================
// 8. Product Detail Experience — Animated Connectors & 3D Protagonist
// ==========================================================================
function initProductDetailConnectors() {
  const stage = document.getElementById('detailExperienceStage');
  const canvas = document.getElementById('detailConnectorCanvas');
  const centralImg = document.getElementById('detailCentralBattery');
  const callouts = document.querySelectorAll('.floating-callout-card');
  if (!stage || !canvas || !centralImg || !callouts.length) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let pulseProgress = 0;
  let inView = true;

  // Connector curves only make sense in the two-column desktop layout; on mobile
  // the callouts stack, so the loop is stopped rather than left idling on rAF.
  const connectorsDisabled = () => isMobile() || prefersReducedMotion();

  function resizeCanvas() {
    if (connectorsDisabled()) {
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';
    const dpr = window.devicePixelRatio || 1;
    canvas.width = stage.offsetWidth * dpr;
    canvas.height = stage.offsetHeight * dpr;
    canvas.style.width = `${stage.offsetWidth}px`;
    canvas.style.height = `${stage.offsetHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', debounce(() => {
    resizeCanvas();
    if (connectorsDisabled()) stopDraw();
    else startDraw();
  }, 180), { passive: true });
  resizeCanvas();

  function draw() {

    ctx.clearRect(0, 0, stage.offsetWidth, stage.offsetHeight);
    const stageRect = stage.getBoundingClientRect();
    const batteryRect = centralImg.getBoundingClientRect();

    const batteryCenter = {
      x: batteryRect.left - stageRect.left + batteryRect.width / 2,
      y: batteryRect.top - stageRect.top + batteryRect.height / 2
    };

    pulseProgress = (pulseProgress + 0.012) % 1;

    callouts.forEach(callout => {
      const cRect = callout.getBoundingClientRect();
      const isLeft = cRect.left < batteryRect.left;
      const calloutAnchor = {
        x: cRect.left - stageRect.left + (isLeft ? cRect.width : 0),
        y: cRect.top - stageRect.top + cRect.height / 2
      };

      // Draw subtle bezier connecting curve
      ctx.beginPath();
      ctx.moveTo(calloutAnchor.x, calloutAnchor.y);
      const cpX = (calloutAnchor.x + batteryCenter.x) / 2;
      ctx.bezierCurveTo(cpX, calloutAnchor.y, cpX, batteryCenter.y, batteryCenter.x, batteryCenter.y);
      ctx.strokeStyle = 'rgba(0, 168, 45, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glowing anchor node at callout card
      ctx.beginPath();
      ctx.arc(calloutAnchor.x, calloutAnchor.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00B83F';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00B83F';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Animated energy packet traveling along curve
      const t = (pulseProgress + 0.3) % 1;
      const invT = 1 - t;
      const px = invT * invT * invT * calloutAnchor.x +
                 3 * invT * invT * t * cpX +
                 3 * invT * t * t * cpX +
                 t * t * t * batteryCenter.x;
      const py = invT * invT * invT * calloutAnchor.y +
                 3 * invT * invT * t * calloutAnchor.y +
                 3 * invT * t * t * batteryCenter.y +
                 t * t * t * batteryCenter.y;

      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00B83F';
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    animationFrameId = requestAnimationFrame(draw);
  }

  function startDraw() {
    if (connectorsDisabled() || !inView) return;
    if (animationFrameId === null) animationFrameId = requestAnimationFrame(draw);
  }

  function stopDraw() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) startDraw();
      else stopDraw();
    }, { threshold: 0 }).observe(stage);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopDraw();
    else startDraw();
  });

  startDraw();

  // Subtle Protagonist Battery 3D Rotation on Scroll
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.to(centralImg, {
      scrollTrigger: {
        trigger: stage,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2
      },
      rotationY: 15,
      scale: 1.03,
      ease: 'none'
    });
  }
}

// ==========================================================================
// 9. Exploded Battery Technology Cutaway Motion
// ==========================================================================
function initExplodedCutawayMotion() {
  const cutawayImg = document.getElementById('cutawaySvgImg');
  const layerCards = document.querySelectorAll('.exploded-layer-card');
  if (!cutawayImg || !layerCards.length) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Staggered reveal for layer cards
    gsap.utils.toArray(layerCards).forEach((card, idx) => {
      revealOnScroll(card, { x: 40, opacity: 0 },
        { trigger: '#technology', start: 'top 75%', duration: 0.6, delay: idx * 0.1 });
    });

    // Active layer highlight on scroll
    layerCards.forEach((card, idx) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 65%',
        end: 'bottom 40%',
        onEnter: () => activateLayer(idx),
        onEnterBack: () => activateLayer(idx),
        onLeave: () => card.classList.remove('active-layer'),
        onLeaveBack: () => card.classList.remove('active-layer')
      });
    });

    function activateLayer(idx) {
      layerCards.forEach((c, i) => {
        if (i === idx) c.classList.add('active-layer');
        else c.classList.remove('active-layer');
      });
      if (cutawayImg) {
        cutawayImg.style.transform = `scale(${1 + idx * 0.012}) translateY(${-idx * 2}px)`;
      }
    }
  }
}

// ==========================================================================
// 10. Performance Statistics Animated Numbers
// ==========================================================================
function initPerformanceCounters() {
  const section = document.getElementById('statistics');
  if (!section) return;

  const counters = section.querySelectorAll('.counter');
  if (!counters.length) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target, 10);
      const obj = { val: 0 };
      gsap.to(obj, {
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        val: target,
        duration: 2.2,
        ease: 'power2.out',
        onUpdate: () => {
          counter.textContent = Math.round(obj.val);
        }
      });
    });
  } else {
    // Fallback IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          counters.forEach(counter => {
            const target = parseInt(counter.dataset.target, 10);
            const duration = 2000;
            const start = performance.now();

            function update(now) {
              const progress = Math.min((now - start) / duration, 1);
              const easeOut = 1 - Math.pow(1 - progress, 3);
              counter.textContent = Math.round(easeOut * target);
              if (progress < 1) requestAnimationFrame(update);
              else counter.textContent = target;
            }
            requestAnimationFrame(update);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }
}

// ==========================================================================
// 11. Applications, Why Felix & Manufacturing Scroll Stagger
// ==========================================================================
function initApplicationsAndManufacturingMotion() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Applications cards staggered entrance
  revealOnScroll('.app-card', { y: 40, opacity: 0, scale: 0.95 },
    { trigger: '#applications', start: 'top 78%', stagger: 0.1, duration: 0.7 });

  // Manufacturing timeline cards
  revealOnScroll('.timeline-step-card', { y: 35, opacity: 0, scale: 0.96 },
    { trigger: '#manufacturing', start: 'top 78%', stagger: 0.12, duration: 0.65 });

  // Why Felix benefit cards
  revealOnScroll('.benefit-card', { y: 35, opacity: 0, scale: 0.95 },
    { trigger: '#why-felix', start: 'top 78%', stagger: 0.09, duration: 0.6, ease: 'back.out(1.4)' });

  // Section headers — all sections get a subtle reveal
  gsap.utils.toArray('.section-header').forEach(header => {
    revealOnScroll(header.children, { y: 30, opacity: 0 },
      { trigger: header, start: 'top 85%', stagger: 0.12, duration: 0.7 });
  });

  // Stats counters boxes
  revealOnScroll('.stat-metric-box', { y: 30, opacity: 0, scale: 0.92 },
    { trigger: '#statistics', start: 'top 80%', stagger: 0.12, duration: 0.65, ease: 'back.out(1.6)' });

  // Reviews aggregate box
  revealOnScroll('.reviews-aggregate-box', { y: 25, opacity: 0 },
    { trigger: '#testimonials', start: 'top 80%', duration: 0.7 });

  // Testimonial cards stagger
  revealOnScroll('.testimonial-card', { y: 40, opacity: 0 },
    { trigger: '#testimonials', start: 'top 75%', stagger: 0.1, duration: 0.6 });

  // Floating callout cards in experience section
  revealOnScroll('.floating-callout-card', { scale: 0.85, opacity: 0 },
    { trigger: '#experience', start: 'top 75%', stagger: 0.1, duration: 0.65, ease: 'back.out(1.4)' });
}

// ==========================================================================
// 12. Verified Customer Reviews Filter
// ==========================================================================
function initReviewsFilter() {
  const filterBtns = document.querySelectorAll('.rev-filter-pill');
  const cards = document.querySelectorAll('.testimonial-card');
  const counter = document.getElementById('reviewCounter');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      let visibleCount = 0;
      cards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          visibleCount++;
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.display = 'none';
        }
      });

      if (counter) {
        if (filter === 'all') {
          counter.textContent = `Showing all ${cards.length} reviews`;
        } else {
          counter.textContent = `Showing ${visibleCount} of ${cards.length} reviews`;
        }
      }
    });
  });
}

// ==========================================================================
// 13. Automotive Battery Finder
// ==========================================================================
function initBatteryFinder() {
  const typeSelect = document.getElementById('finderVehicleType');
  const makeSelect = document.getElementById('finderMake');
  const modelSelect = document.getElementById('finderModel');
  const resultBox = document.getElementById('finderResultBox');
  const resImg = document.getElementById('finderResImg');
  const resModel = document.getElementById('finderResModel');
  const resSpecs = document.getElementById('finderResSpecs');
  const resCta = document.getElementById('finderResCta');
  if (!typeSelect || !makeSelect || !modelSelect) return;

  const VEHICLE_DATA = {
    Car: {
      'Maruti Suzuki': ['Swift (Petrol)', 'Brezza', 'Baleno', 'Dzire', 'Alto K10', 'Ertiga (Diesel)'],
      'Hyundai': ['Creta (Petrol)', 'i20', 'Venue', 'Verna', 'Tucson'],
      'Tata Motors': ['Nexon', 'Harrier', 'Safari', 'Punch', 'Altroz'],
      'Mahindra': ['Scorpio-N', 'XUV700', 'Thar', 'Bolero Neo'],
      'Toyota': ['Innova Crysta', 'Fortuner', 'Urban Cruiser Hyryder']
    },
    Tractor: {
      'Mahindra Tractors': ['575 DI (45 HP)', '275 DI TU', 'Arjun Novo 605'],
      'John Deere': ['5050 D (50 HP)', '5310 4WD GearPro'],
      'Sonalika': ['DI 745 III Sikander', 'Tiger DI 65'],
      'Swaraj': ['744 FE (48 HP)', '855 FE']
    },
    Truck: {
      'Tata Motors Commercial': ['Signa 4825.TK', 'Prima 5530.S', 'LPT 1918'],
      'Ashok Leyland': ['Ecomet 1615', 'AVTR 4220', 'Captain 2828'],
      'BharatBenz': ['1923C Tipper', '2823R Heavy Truck']
    },
    Motorcycle: {
      'Hero MotoCorp': ['Splendor Plus', 'HF Deluxe', 'Xpulse 200'],
      'Honda': ['Activa 6G', 'Shine 125', 'Hornet 2.0'],
      'Bajaj': ['Pulsar 150', 'Pulsar NS200', 'Platina 110'],
      'Royal Enfield': ['Classic 350', 'Hunter 350', 'Himalayan 450']
    }
  };

  function updateMakes() {
    const category = typeSelect.value;
    makeSelect.innerHTML = '<option value="">Select Manufacturer</option>';
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    modelSelect.disabled = true;
    if (resultBox) resultBox.style.display = 'none';

    if (VEHICLE_DATA[category]) {
      Object.keys(VEHICLE_DATA[category]).forEach(make => {
        const opt = document.createElement('option');
        opt.value = make;
        opt.textContent = make;
        makeSelect.appendChild(opt);
      });
    }
  }

  typeSelect.addEventListener('change', updateMakes);
  updateMakes();

  makeSelect.addEventListener('change', () => {
    const category = typeSelect.value;
    const make = makeSelect.value;
    modelSelect.innerHTML = '<option value="">Select Model</option>';

    if (category && make && VEHICLE_DATA[category][make]) {
      modelSelect.disabled = false;
      VEHICLE_DATA[category][make].forEach(model => {
        const opt = document.createElement('option');
        opt.value = model;
        opt.textContent = model;
        modelSelect.appendChild(opt);
      });
    } else {
      modelSelect.disabled = true;
    }
    if (resultBox) resultBox.style.display = 'none';
  });

  modelSelect.addEventListener('change', () => {
    const cat = typeSelect.value;
    const model = modelSelect.value;
    if (!model || !resultBox) return;

    resultBox.style.display = 'block';

    if (cat === 'Car') {
      resModel.textContent = 'Felix FX 700 (65Ah)';
      resSpecs.textContent = '12V 65Ah • 610 CCA • 48 Months Warranty • Magic Eye Indicator';
      resImg.src = 'assets/images/products/battery-fx700-automotive.png';
      resCta.onclick = () => openSpecsModal('fx700');
    } else if (cat === 'Tractor') {
      resModel.textContent = 'Felix FX 1000 Tractor (90Ah)';
      resSpecs.textContent = '12V 90Ah • 850 CCA • 36 Months Warranty • Vibration-Proof Cast';
      resImg.src = 'assets/images/products/battery-fx1000-tractor.png';
      resCta.onclick = () => openQuoteModal(`Felix FX 1000 Tractor for ${model}`);
    } else if (cat === 'Truck') {
      resModel.textContent = 'Felix FX 1500 Heavy Commercial (150Ah)';
      resSpecs.textContent = '12V 150Ah • 1,050 CCA • Class V3 Anti-Vibration Casing';
      resImg.src = 'assets/images/products/battery-fx1000-tractor.png';
      resCta.onclick = () => openQuoteModal(`Felix FX 1500 Commercial for ${model}`);
    } else {
      resModel.textContent = 'Felix FX 5LB Motorcycle (5Ah)';
      resSpecs.textContent = '12V 5Ah • Sealed Spill-Proof VRLA • 24 Months Warranty';
      resImg.src = 'assets/images/products/battery-ns40-small.png';
      resCta.onclick = () => openQuoteModal(`Felix Motorcycle Battery for ${model}`);
    }
  });
}

// ==========================================================================
// 14. Inverter Load Sizing Calculator
// ==========================================================================
function initLoadCalculator() {
  const container = document.getElementById('calcAppliancesList');
  const hoursSlider = document.getElementById('calcBackupHoursSlider');
  const hoursVal = document.getElementById('calcBackupHoursVal');
  const totalLoadEl = document.getElementById('calcTotalLoad');
  const inverterVAEl = document.getElementById('calcInverterVA');
  const ahNeededEl = document.getElementById('calcAhNeeded');
  const recNameEl = document.getElementById('calcRecName');
  const recDescEl = document.getElementById('calcRecDesc');
  if (!container || !hoursSlider) return;

  const APPLIANCES = [
    { name: 'LED Bulbs (9W)', watts: 9, defaultQty: 4, icon: 'fa-lightbulb' },
    { name: 'Ceiling Fans (75W)', watts: 75, defaultQty: 2, icon: 'fa-fan' },
    { name: 'Smart LED TV (100W)', watts: 100, defaultQty: 1, icon: 'fa-tv' },
    { name: 'Laptop / PC (65W)', watts: 65, defaultQty: 1, icon: 'fa-laptop' },
    { name: 'Refrigerator (200W)', watts: 200, defaultQty: 0, icon: 'fa-snowflake' }
  ];

  let state = {};
  container.innerHTML = '';

  APPLIANCES.forEach((app, idx) => {
    state[idx] = app.defaultQty;
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.justifyContent = 'space-between';
    item.style.padding = '12px 0';
    item.style.borderBottom = '1px solid var(--border-light)';

    item.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px">
        <i class="fa-solid ${app.icon}" style="color:var(--felix-green);width:20px;text-align:center"></i>
        <div>
          <div style="font-weight:600;font-size:0.9rem">${app.name}</div>
          <div style="font-size:0.75rem;color:var(--text-tertiary)">${app.watts} Watts each</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <button type="button" class="calc-btn minus" data-idx="${idx}" aria-label="Decrease quantity">-</button>
        <span id="qty_${idx}" style="font-family:var(--font-display);font-weight:700;width:24px;text-align:center">${app.defaultQty}</span>
        <button type="button" class="calc-btn plus" data-idx="${idx}" aria-label="Increase quantity">+</button>
      </div>
    `;
    container.appendChild(item);
  });

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('minus')) {
      const idx = e.target.dataset.idx;
      if (state[idx] > 0) {
        state[idx]--;
        document.getElementById(`qty_${idx}`).textContent = state[idx];
        calculate();
      }
    } else if (e.target.classList.contains('plus')) {
      const idx = e.target.dataset.idx;
      if (state[idx] < 12) {
        state[idx]++;
        document.getElementById(`qty_${idx}`).textContent = state[idx];
        calculate();
      }
    }
  });

  hoursSlider.addEventListener('input', () => {
    hoursVal.textContent = `${hoursSlider.value} Hours`;
    calculate();
  });

  function calculate() {
    let totalWatts = 0;
    APPLIANCES.forEach((app, idx) => {
      totalWatts += app.watts * state[idx];
    });

    const hours = parseInt(hoursSlider.value);
    const inverterVA = Math.max(Math.ceil((totalWatts / 0.8) / 100) * 100, 400);
    // Ah = (Total Watts * Hours) / (12V * Inverter Efficiency 0.85)
    const ahRequired = Math.round((totalWatts * hours) / (12 * 0.85));

    totalLoadEl.textContent = `${totalWatts} W`;
    inverterVAEl.textContent = `${inverterVA} VA`;
    ahNeededEl.textContent = `${ahRequired} Ah`;

    if (ahRequired <= 120) {
      recNameEl.textContent = 'Felix IT-1200 Tall Tubular (120Ah)';
      recDescEl.textContent = '12V 120Ah C20 Tubular Battery • 48 Months Warranty';
    } else if (ahRequired <= 160) {
      recNameEl.textContent = 'Felix IT-1500 Tall Tubular (150Ah)';
      recDescEl.textContent = '12V 150Ah C20 Tubular Battery • 60 Months Warranty';
    } else if (ahRequired <= 200) {
      recNameEl.textContent = 'Felix IT-1800 Tall Tubular (180Ah)';
      recDescEl.textContent = '12V 180Ah C20 Heavy Duty Tubular • 60 Months Warranty';
    } else {
      recNameEl.textContent = 'Felix IT-2500 Tall Tubular (240Ah / Dual Array)';
      recDescEl.textContent = '12V 240Ah High-Capacity Storage for Extended Outages';
    }
  }

  calculate();
}

// ==========================================================================
// 15. Modals & Technical Specifications Viewer
// ==========================================================================
let modalScrollY = 0;

// Opening a modal must freeze the page behind it. Without this, iOS Safari keeps
// scrolling the body under the overlay and loses the reader's place on close.
window.openModalEl = function (modal) {
  if (!modal) return;
  modalScrollY = window.scrollY;
  modal.classList.add('open');
  document.body.style.top = `-${modalScrollY}px`;
  document.body.classList.add('nav-scroll-locked');
  if (lenis) lenis.stop();
};

window.closeAllModals = function () {
  const wasOpen = document.querySelector('.modal-backdrop.open');
  document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
  if (!wasOpen) return;
  document.body.classList.remove('nav-scroll-locked');
  document.body.style.top = '';
  window.scrollTo(0, modalScrollY);
  if (lenis) lenis.start();
};

function initModals() {
  document.querySelectorAll('.modal-close-btn, .modal-backdrop').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || e.target.classList.contains('modal-close-btn')) {
        window.closeAllModals();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeAllModals();
  });

  const quoteForm = document.getElementById('quickQuoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('quoteNameInput').value;
      const model = document.getElementById('quoteModelInput').value;
      showToast(`Thank you, ${name}! Your quote request for ${model} has been dispatched.`);
      window.closeAllModals();
      quoteForm.reset();
    });
  }
}

window.openQuoteModal = function(modelName) {
  const modal = document.getElementById('quoteModal');
  const input = document.getElementById('quoteModelInput');
  if (input && modelName) input.value = modelName;
  window.openModalEl(modal);
};

window.openSpecsModal = function(modelId) {
  const modal = document.getElementById('specsModal');
  const title = document.getElementById('specsModalTitle');
  const tag = document.getElementById('specsModalTag');
  const body = document.getElementById('specsModalBody');
  if (!modal || !body) return;

  // Search in FELIX_PRODUCTS from battery-data.js
  let product = null;
  if (typeof FELIX_PRODUCTS !== 'undefined' && Array.isArray(FELIX_PRODUCTS)) {
    product = FELIX_PRODUCTS.find(p => p.id === modelId || p.id.startsWith(modelId) || p.model.toLowerCase().includes(modelId.toLowerCase()));
  }

  // Pre-configured fallbacks for showcase models
  const FALLBACK_SPECS = {
    fx800: {
      model: 'Felix FX 800 (80Ah)',
      series: 'Heavy Duty Automotive',
      category: 'Automotive & Commercial',
      volt: 12,
      ah20: 80,
      cca: 720,
      warranty: '48 Months (24+24)',
      dimensions: '305 x 173 x 225 mm',
      layout: 'Left Polarity (Layout 0)',
      terminal: 'Standard Automotive Post',
      image: 'assets/images/products/battery-fx700-automotive.png',
      suitableFor: 'Toyota Fortuner, Mahindra Scorpio-N, Tata Safari, Heavy Diesel 4x4',
      features: ['Silver-Calcium Alloy Spines', 'High Density Active Material', 'Magic Eye Optical Hydrometer']
    },
    fx700: {
      model: 'Felix FX 700 (65Ah)',
      series: 'Passenger Car & SUV',
      category: 'Automotive',
      volt: 12,
      ah20: 65,
      cca: 610,
      warranty: '48 Months (24+24)',
      dimensions: '260 x 173 x 225 mm',
      layout: 'Right Polarity (Layout 1)',
      terminal: 'Standard Automotive Post',
      image: 'assets/images/products/battery-fx700-automotive.png',
      suitableFor: 'Hyundai Creta, Kia Seltos, Honda City, VW Virtus, Sedans & Crossovers',
      features: ['Calcium-Calcium Grids', 'Low Water Loss PE Envelope', 'Flame Arrestor Lid']
    },
    fx600: {
      model: 'Felix FX 600 (55Ah)',
      series: 'Passenger Vehicles',
      category: 'Automotive',
      volt: 12,
      ah20: 55,
      cca: 520,
      warranty: '36 Months (24+12)',
      dimensions: '242 x 175 x 190 mm',
      layout: 'Left / Right Available',
      terminal: 'Standard Post',
      image: 'assets/images/products/battery-fx400-compact.png',
      suitableFor: 'Maruti Brezza, Hyundai i20, Tata Nexon, Compact Hatchbacks',
      features: ['High Vibration Endurance', 'Instant Sub-Zero Ignition', 'Factory Charged']
    },
    fx500: {
      model: 'Felix FX 500 (45Ah)',
      series: 'City Compact Cars',
      category: 'Automotive',
      volt: 12,
      ah20: 45,
      cca: 410,
      warranty: '36 Months (24+12)',
      dimensions: '238 x 129 x 227 mm',
      layout: 'Left / Right Available',
      terminal: 'Type B Post',
      image: 'assets/images/products/battery-fx400-compact.png',
      suitableFor: 'Maruti Swift, WagonR, Alto K10, Hyundai Grand i10, City Taxis',
      features: ['Compact High-Output Form Factor', 'Magic Eye Level Indicator', 'Spill-Proof Polypropylene Case']
    },
    it1800: {
      model: 'Felix IT-1800 Tall Tubular (180Ah)',
      series: 'Home & Office Inverter',
      category: 'Inverter Tubular',
      volt: 12,
      ah20: 180,
      cca: 950,
      warranty: '60 Months (36+24)',
      dimensions: '505 x 190 x 410 mm',
      layout: 'Top Terminal with Ceramic Indicators',
      terminal: 'Solid Brass Stud',
      image: 'assets/images/products/battery-tubular-inverter.png',
      suitableFor: 'High-Load Inverters, Diagnostic Clinics, Continuous Commercial Backup',
      features: ['High-Pressure Die-Cast Spine (HADI)', 'Micro-Porous Ceramic Vent Plugs', '5,000+ Deep Cycles']
    },
    solar220: {
      model: 'Felix Solar 220 Deep Cycle (220Ah)',
      series: 'Solar Renewable Storage',
      category: 'Solar Photovoltaic',
      volt: 12,
      ah20: 220,
      cca: 1100,
      warranty: '60 Months Full Warranty',
      dimensions: '505 x 190 x 410 mm',
      layout: 'Dual Terminal Marine/Post',
      terminal: 'Heavy Duty Stud',
      image: 'assets/images/products/battery-tubular-tall-handle.png',
      suitableFor: 'Off-Grid Solar Rooftops, Farm Water Pumps, Telecom Tower UPS Arrays',
      features: ['C10 Rating for Solar Applications', 'Extremely Low Self-Discharge (<2%/mo)', 'Overcharge & Deep Discharge Tolerant']
    }
  };

  const item = product || FALLBACK_SPECS[modelId] || FALLBACK_SPECS.fx700;

  if (tag) tag.textContent = `${item.series.toUpperCase()} • 12V ${item.ah20 || item.ah5 || 65}Ah`;
  if (title) title.textContent = item.model;

  body.innerHTML = `
    <div class="specs-modal-grid">
      <div class="specs-modal-img-wrap">
        <img src="${item.image}" alt="${item.model}" class="specs-modal-img">
        <div class="specs-modal-img-caption"><i class="fa-solid fa-shield-halved" style="color:var(--felix-green);margin-right:4px"></i> ${item.warranty}</div>
      </div>
      <div>
        <div class="specs-table-wrap">
          <div class="specs-table-row">
            <span class="specs-table-label">Nominal Voltage</span>
            <span class="specs-table-val">${item.volt} Volts</span>
          </div>
          <div class="specs-table-row">
            <span class="specs-table-label">Capacity (C20 / C10)</span>
            <span class="specs-table-val">${item.ah20 || item.ah5} Ah</span>
          </div>
          <div class="specs-table-row">
            <span class="specs-table-label">Cold Cranking Amps (CCA)</span>
            <span class="specs-table-val">${item.cca || 'N/A'} A</span>
          </div>
          <div class="specs-table-row">
            <span class="specs-table-label">Dimensions (L x W x H)</span>
            <span class="specs-table-val">${item.dimensions || 'Standard DIN/JIS'}</span>
          </div>
          <div class="specs-table-row">
            <span class="specs-table-label">Terminal / Polarity</span>
            <span class="specs-table-val">${item.layout || 'Layout 0/1'}</span>
          </div>
          <div class="specs-table-row">
            <span class="specs-table-label">Warranty</span>
            <span class="specs-table-val" style="color:var(--felix-green-dark)">${item.warranty}</span>
          </div>
        </div>

        <div style="font-size:0.82rem;font-weight:700;color:var(--text-secondary);margin-top:14px">RECOMMENDED APPLICATION:</div>
        <div style="font-size:0.84rem;color:var(--text-primary);margin-top:2px">${item.suitableFor || 'Automotive & Commercial Vehicles'}</div>

        <div class="specs-features-list">
          ${(item.features || ['Maintenance Free', 'High Cranking', 'Calcium Alloy']).map(f => `<span class="specs-feature-pill"><i class="fa-solid fa-check" style="margin-right:4px"></i>${f}</span>`).join('')}
        </div>
      </div>
    </div>

    <div class="specs-actions-bar">
      <a href="https://wa.me/917775072950?text=Hello%20Felix%20Batteries%2C%20I%20am%20interested%20in%20${encodeURIComponent(item.model)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:8px">
        <i class="fa-brands fa-whatsapp" style="color:#25D366;font-size:1.1rem"></i> Order via WhatsApp
      </a>
      <button class="btn btn-primary" onclick="openQuoteModal('${item.model.replace(/'/g, "\\'")}')">
        <i class="fa-solid fa-bolt"></i> Request Official Quote
      </button>
    </div>
  `;

  window.openModalEl(modal);
};

// ==========================================================================
// 16. Contact Form & Toast
// ==========================================================================
function initContactForm() {
  const form = document.getElementById('contactEnquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const req = document.getElementById('contactRequirement').value;
    showToast(`Thank you, ${name}! Your inquiry for ${req} has been sent to our sales desk.`);
    form.reset();
  });
}

function showToast(msg) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--felix-green-glow);font-size:1.2rem"></i> <span>${msg}</span>`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
}

// ==========================================================================
// 17. Mobile Navigation & Progress Bar
// ==========================================================================
function initMobileNav() {
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('navMenuList');
  const navbar = document.getElementById('navbarMain');
  if (!toggle || !menu) return;

  const toggleIcon = toggle.querySelector('i');
  let scrollLockY = 0;

  function lockBody() {
    scrollLockY = window.scrollY;
    document.body.style.top = `-${scrollLockY}px`;
    document.body.classList.add('nav-scroll-locked');
  }

  function unlockBody() {
    document.body.classList.remove('nav-scroll-locked');
    document.body.style.top = '';
    window.scrollTo(0, scrollLockY);
  }

  function openMenu() {
    menu.classList.add('open');
    document.body.classList.add('mobile-nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (toggleIcon) toggleIcon.className = 'fa-solid fa-xmark';
    lockBody();
    if (lenis) lenis.stop();
  }

  function closeMenu() {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open');
    document.body.classList.remove('mobile-nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (toggleIcon) toggleIcon.className = 'fa-solid fa-bars';
    unlockBody();
    if (lenis) lenis.start();
  }

  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'navMenuList');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu.classList.contains('open')) closeMenu();
    else openMenu();
  });

  // Close on link tap, then jump to the section.
  // Order matters: closeMenu() unlocks the body, which restores the scroll
  // position captured when the drawer opened. Scrolling to the anchor has to
  // happen *after* that restore or it is immediately undone.
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const target = href && href !== '#' ? document.querySelector(href) : null;

      if (!target) {
        closeMenu();
        return;
      }

      e.preventDefault();
      closeMenu();

      // Let the drawer's collapse and the body unlock settle before measuring.
      requestAnimationFrame(() => {
        const offset = (navbar ? navbar.offsetHeight : 64) + 8;
        if (lenis) {
          lenis.scrollTo(target, { offset: -offset, duration: 1.2 });
        } else {
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
      });
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('open')) return;
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  window.addEventListener('resize', debounce(() => {
    if (!isMobile()) closeMenu();
  }, 150), { passive: true });

  // Sticky Navbar Scroll Transition
  onScrollThrottled(() => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Highlight the section currently in view
  initScrollSpy();
}

// Marks the nav link for the section currently on screen
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav-menu .nav-link'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  const map = new Map();
  links.forEach(link => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const section = document.querySelector(id);
    if (section) map.set(section, link);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const link = map.get(entry.target);
      if (!link) return;
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  map.forEach((_link, section) => observer.observe(section));
}

function initScrollProgressBar() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  onScrollThrottled(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const progress = (scrollTop / docHeight) * 100;
      bar.style.width = `${progress}%`;
    }
  });
}

function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  onScrollThrottled(() => {
    btn.classList.toggle('show', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

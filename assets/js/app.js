// ==========================================================================
// FELIX AUTOMOTIVE BATTERIES — HIGH PERFORMANCE MOTION & APP CONTROLLER
// Powered by Lenis Smooth Momentum Scrolling, GSAP 3 & ScrollTrigger
// ==========================================================================

let lenis = null;

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
});

// ==========================================================================
// 1. Lenis Smooth Momentum Scrolling
// ==========================================================================
function initLenis() {
  if (typeof Lenis === 'undefined') return;

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

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  window.addEventListener('resize', () => {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  });

  const particleCount = Math.min(Math.floor(width / 30), 45);
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2.2 + 1,
      alpha: Math.random() * 0.5 + 0.25
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const opacity = (1 - dist / 130) * 0.18;
          ctx.strokeStyle = `rgba(0, 184, 63, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.fillStyle = `rgba(0, 184, 63, ${p.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00B83F';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
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
  if (heroStage && tiltEl) {
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
  floatingTags.forEach((tag, idx) => {
    const speed = parseFloat(tag.dataset.speed) || 0.4;
    gsap.to(tag, {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.4
      },
      y: -150 * speed,
      opacity: 0.25,
      ease: 'power1.out'
    });

    // Gentle idle floating oscillation
    gsap.to(tag, {
      y: '+=7',
      duration: 2.2 + idx * 0.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  });

  // Hero Content Entrance Animation
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero-eyebrow-pill', { y: 24, opacity: 0, duration: 0.6, delay: 0.1 })
    .from('.hero-headline', { y: 35, opacity: 0, duration: 0.8 }, '-=0.4')
    .from('.hero-subheadline', { y: 24, opacity: 0, duration: 0.7 }, '-=0.5')
    .from('.hero-cta-row', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero-metrics-strip > div', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.3')
    .from(heroBattery, { scale: 0.9, opacity: 0, duration: 1, ease: 'power2.out' }, '-=0.8');
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
    gsap.from(card, {
      scrollTrigger: {
        trigger: '#energy',
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      },
      y: 45 + idx * 25,
      opacity: 0,
      scale: 0.94,
      duration: 0.8,
      delay: idx * 0.15,
      ease: 'back.out(1.4)'
    });
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
      // Mobile & Tablet: Native horizontal touch scrolling
      wrap.addEventListener('scroll', () => {
        const scrollLeft = wrap.scrollLeft;
        const maxScroll = wrap.scrollWidth - wrap.clientWidth;
        if (maxScroll > 0 && progressBar) {
          const pct = (scrollLeft / maxScroll) * 100;
          progressBar.style.width = `${Math.max(pct, 16.66)}%`;
        }
        if (counterEl && maxScroll > 0) {
          const cardWidth = 360 + 28;
          const cardIdx = Math.min(Math.floor(scrollLeft / cardWidth) + 1, cards.length);
          counterEl.textContent = `${cardIdx} / ${cards.length}`;
        }
      });
    }
  }

  setupDesktopPin();

  window.addEventListener('resize', () => {
    if (showcaseTween && showcaseTween.scrollTrigger) {
      showcaseTween.scrollTrigger.kill();
      showcaseTween.kill();
      gsap.set(track, { clearProps: 'all' });
      setupDesktopPin();
    }
  });

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
        wrap.scrollBy({ left: -380, behavior: 'smooth' });
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
        wrap.scrollBy({ left: 380, behavior: 'smooth' });
      }
    });
  }

  // Floating hover physics for battery cards
  cards.forEach(card => {
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
    gsap.from(card, {
      scrollTrigger: {
        trigger: '#automotive',
        start: 'top 78%',
        toggleActions: 'play none none reverse'
      },
      y: 40,
      opacity: 0,
      duration: 0.65,
      delay: idx * 0.08,
      ease: 'power2.out'
    });
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

  function resizeCanvas() {
    if (window.innerWidth <= 768) {
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

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function draw() {
    if (window.innerWidth <= 768) {
      animationFrameId = requestAnimationFrame(draw);
      return;
    }

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

  draw();

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
      gsap.from(card, {
        scrollTrigger: {
          trigger: '#technology',
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        },
        x: 40,
        opacity: 0,
        duration: 0.6,
        delay: idx * 0.1,
        ease: 'power2.out'
      });
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
// 11. Applications & Manufacturing Scroll Stagger
// ==========================================================================
function initApplicationsAndManufacturingMotion() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger !== 'undefined') return;

  gsap.from('.app-card', {
    scrollTrigger: {
      trigger: '#applications',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    y: 35,
    opacity: 0,
    stagger: 0.1,
    duration: 0.65,
    ease: 'power2.out'
  });

  gsap.from('.timeline-step-card', {
    scrollTrigger: {
      trigger: '#manufacturing',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    y: 30,
    opacity: 0,
    stagger: 0.1,
    duration: 0.6,
    ease: 'power2.out'
  });
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
        <button type="button" class="calc-btn minus" data-idx="${idx}" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border-medium);background:#FFFFFF;cursor:pointer">-</button>
        <span id="qty_${idx}" style="font-family:var(--font-display);font-weight:700;width:24px;text-align:center">${app.defaultQty}</span>
        <button type="button" class="calc-btn plus" data-idx="${idx}" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border-medium);background:#FFFFFF;cursor:pointer">+</button>
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
function initModals() {
  document.querySelectorAll('.modal-close-btn, .modal-backdrop').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || e.target.classList.contains('modal-close-btn')) {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
      }
    });
  });

  const quoteForm = document.getElementById('quickQuoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('quoteNameInput').value;
      const model = document.getElementById('quoteModelInput').value;
      showToast(`Thank you, ${name}! Your quote request for ${model} has been dispatched.`);
      document.getElementById('quoteModal').classList.remove('open');
      quoteForm.reset();
    });
  }
}

window.openQuoteModal = function(modelName) {
  const modal = document.getElementById('quoteModal');
  const input = document.getElementById('quoteModelInput');
  if (input && modelName) input.value = modelName;
  if (modal) modal.classList.add('open');
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

  modal.classList.add('open');
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
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isVisible = menu.style.display === 'flex';
    if (isVisible) {
      menu.style.display = 'none';
    } else {
      menu.style.display = 'flex';
      menu.style.flexDirection = 'column';
      menu.style.position = 'absolute';
      menu.style.top = '76px';
      menu.style.left = '0';
      menu.style.right = '0';
      menu.style.background = '#FFFFFF';
      menu.style.padding = '24px';
      menu.style.borderBottom = '1px solid var(--border-light)';
      menu.style.gap = '16px';
      menu.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
    }
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) menu.style.display = 'none';
    });
  });

  // Sticky Navbar Scroll Transition
  const navbar = document.getElementById('navbarMain');
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 40) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }
  });
}

function initScrollProgressBar() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
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

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btn.classList.add('show');
    else btn.classList.remove('show');
  });

  btn.addEventListener('click', () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

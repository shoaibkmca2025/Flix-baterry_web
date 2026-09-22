// ==========================================================================
// FELIX AUTOMOTIVE BATTERIES — ANTIGRAVITY MOTION CONTROLLER
// GSAP 3 & ScrollTrigger Parallax, Energy Canvas, Custom Cursor,
// Battery Finder, Inverter Load Calculator, Reviews Filter
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initHeroEnergyCanvas();
  initAntigravityMotion();
  initProductDetailConnectors();
  initPerformanceCounters();
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
// 1. Custom Magnetic Desktop Cursor
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

  // Smooth lerp follower
  function renderFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    requestAnimationFrame(renderFollower);
  }
  requestAnimationFrame(renderFollower);

  // Hover states on clickable elements
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
// 2. Hero Interactive Energy Canvas (Particles & Field Lines)
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

  // Generate energy particles
  const particleCount = Math.min(Math.floor(width / 32), 45);
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

    // Draw connection lines between close particles
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

    // Draw particle nodes
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
// 3. Antigravity Scroll Motion (GSAP & ScrollTrigger)
// ==========================================================================
function initAntigravityMotion() {
  const heroStage = document.getElementById('heroAntigravityStage');
  const heroBattery = document.getElementById('heroBatteryWrapper');
  const floatingTags = document.querySelectorAll('.hero-floating-tag');

  // If GSAP & ScrollTrigger loaded, use hardware-accelerated timelines
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Battery 3D Upward Levitation & Subtle Rotation
    if (heroBattery) {
      gsap.to(heroBattery, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        },
        y: -90,
        rotationZ: 6,
        rotationY: -10,
        scale: 1.06,
        ease: 'power1.out'
      });
    }

    // Independent multi-speed parallax on floating technical labels
    floatingTags.forEach(tag => {
      const speed = parseFloat(tag.dataset.speed) || 0.4;
      gsap.to(tag, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.4
        },
        y: -140 * speed,
        x: (Math.random() - 0.5) * 40 * speed,
        opacity: 0.2,
        ease: 'power1.out'
      });
    });

    // Clean Energy Telemetry Cards Parallax
    gsap.utils.toArray('.telemetry-card').forEach((card, idx) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: '#energy',
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        },
        y: 40 + idx * 20,
        opacity: 0,
        duration: 0.8,
        delay: idx * 0.15,
        ease: 'power2.out'
      });
    });

    // Automotive Drive Cards Reveal
    gsap.utils.toArray('.drive-card').forEach((card, idx) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: '#automotive',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 35,
        opacity: 0,
        duration: 0.6,
        delay: idx * 0.08,
        ease: 'power2.out'
      });
    });

    // Exploded Cutaway Layers Separation
    gsap.utils.toArray('.exploded-layer-card').forEach((layer, idx) => {
      gsap.from(layer, {
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

  } else {
    // Fallback lightweight scroll listener
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (heroBattery && scrollY < 800) {
        heroBattery.style.transform = `translateY(${-scrollY * 0.18}px) rotate(${scrollY * 0.015}deg)`;
      }
      floatingTags.forEach(tag => {
        const speed = parseFloat(tag.dataset.speed) || 0.4;
        if (scrollY < 800) {
          tag.style.transform = `translateY(${-scrollY * 0.28 * speed}px)`;
        }
      });
    });
  }

  // 3D Tilt On Mousemove for Hero Battery
  if (heroStage && heroBattery) {
    heroStage.addEventListener('mousemove', (e) => {
      const rect = heroStage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotY = (x / rect.width) * 14;
      const rotX = -(y / rect.height) * 14;
      heroBattery.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.02)`;
    });

    heroStage.addEventListener('mouseleave', () => {
      heroBattery.style.transform = '';
    });
  }
}

// ==========================================================================
// 4. Product Detail Experience — Animated SVG/Canvas Connectors
// ==========================================================================
function initProductDetailConnectors() {
  const stage = document.getElementById('detailExperienceStage');
  const canvas = document.getElementById('detailConnectorCanvas');
  const centralImg = document.getElementById('detailCentralBattery');
  const callouts = document.querySelectorAll('.floating-callout-card');
  if (!stage || !canvas || !centralImg || !callouts.length) return;

  const ctx = canvas.getContext('2d');
  function resizeCanvas() {
    canvas.width = stage.offsetWidth;
    canvas.height = stage.offsetHeight;
    drawConnectors();
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function drawConnectors() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const stageRect = stage.getBoundingClientRect();
    const batteryRect = centralImg.getBoundingClientRect();

    const batteryCenter = {
      x: batteryRect.left - stageRect.left + batteryRect.width / 2,
      y: batteryRect.top - stageRect.top + batteryRect.height / 2
    };

    callouts.forEach(callout => {
      const cRect = callout.getBoundingClientRect();
      const calloutAnchor = {
        x: cRect.left - stageRect.left + (cRect.left < batteryRect.left ? cRect.width : 0),
        y: cRect.top - stageRect.top + cRect.height / 2
      };

      // Draw subtle bezier connector
      ctx.beginPath();
      ctx.moveTo(calloutAnchor.x, calloutAnchor.y);
      const cpX = (calloutAnchor.x + batteryCenter.x) / 2;
      ctx.bezierCurveTo(cpX, calloutAnchor.y, cpX, batteryCenter.y, batteryCenter.x, batteryCenter.y);
      ctx.strokeStyle = 'rgba(0, 168, 45, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Anchor node
      ctx.beginPath();
      ctx.arc(calloutAnchor.x, calloutAnchor.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00B83F';
      ctx.fill();
    });
  }

  // Draw once after layout settle
  setTimeout(drawConnectors, 400);

  // Subtle rotation on scroll
  window.addEventListener('scroll', () => {
    const rect = stage.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const rot = (progress - 0.5) * 12;
      centralImg.style.transform = `perspective(1000px) rotateY(${rot.toFixed(2)}deg)`;
    }
  });
}

// ==========================================================================
// 5. Performance Statistics Animated Numbers
// ==========================================================================
function initPerformanceCounters() {
  const section = document.getElementById('statistics');
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('.counter');
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.target);
          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.round(easeOut * target);
            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              counter.textContent = target;
            }
          }
          requestAnimationFrame(update);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(section);
}

// ==========================================================================
// 6. Verified Customer Reviews Filter
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
// 7. Automotive Battery Finder
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
      resSpecs.textContent = '12V 65Ah &bull; 610 CCA &bull; 48 Months Warranty &bull; Magic Eye Indicator';
      resImg.src = 'assets/images/products/battery-fx700-automotive.png';
      resCta.onclick = () => openQuoteModal(`Felix FX 700 for ${model}`);
    } else if (cat === 'Tractor') {
      resModel.textContent = 'Felix FX 1000 Tractor (90Ah)';
      resSpecs.textContent = '12V 90Ah &bull; 850 CCA &bull; 36 Months Warranty &bull; Vibration-Proof Cast';
      resImg.src = 'assets/images/products/battery-fx1000-tractor.png';
      resCta.onclick = () => openQuoteModal(`Felix FX 1000 Tractor for ${model}`);
    } else if (cat === 'Truck') {
      resModel.textContent = 'Felix FX 1500 Heavy Commercial (150Ah)';
      resSpecs.textContent = '12V 150Ah &bull; 1,050 CCA &bull; Class V3 Anti-Vibration Casing';
      resImg.src = 'assets/images/products/battery-fx1000-tractor.png';
      resCta.onclick = () => openQuoteModal(`Felix FX 1500 Commercial for ${model}`);
    } else {
      resModel.textContent = 'Felix FX 5LB Motorcycle (5Ah)';
      resSpecs.textContent = '12V 5Ah &bull; Sealed Spill-Proof VRLA &bull; 24 Months Warranty';
      resImg.src = 'assets/images/products/battery-ns40-small.png';
      resCta.onclick = () => openQuoteModal(`Felix Motorcycle Battery for ${model}`);
    }
  });
}

// ==========================================================================
// 8. Inverter Load Sizing Calculator
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
      recDescEl.textContent = '12V 120Ah C20 Tubular Battery &bull; 48 Months Warranty';
    } else if (ahRequired <= 160) {
      recNameEl.textContent = 'Felix IT-1500 Tall Tubular (150Ah)';
      recDescEl.textContent = '12V 150Ah C20 Tubular Battery &bull; 60 Months Warranty';
    } else if (ahRequired <= 200) {
      recNameEl.textContent = 'Felix IT-1800 Tall Tubular (180Ah)';
      recDescEl.textContent = '12V 180Ah C20 Heavy Duty Tubular &bull; 60 Months Warranty';
    } else {
      recNameEl.textContent = 'Felix IT-2500 Tall Tubular (240Ah / Dual Array)';
      recDescEl.textContent = '12V 240Ah High-Capacity Storage for Extended Outages';
    }
  }

  calculate();
}

// ==========================================================================
// 9. Modals & Quote Popups
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

// ==========================================================================
// 10. Contact Form Submission
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

// Toast notification
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
// 11. Mobile Navigation & Scroll Progress
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

  // Sticky Navbar Scroll effect
  const navbar = document.getElementById('navbarMain');
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });
}

function initScrollProgressBar() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    bar.style.width = `${progress}%`;
  });
}

function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

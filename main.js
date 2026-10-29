/**
 * NOCTIS — Scrollytelling Engine, Interactive Accordion, Custom Cursor & Global Effects
 * Vanilla JavaScript (No frameworks, no build tools, no external libraries)
 */

(function () {
  'use strict';

  // --- Global State ---
  const CONFIG = window.CONFIG;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  let isMobile = window.innerWidth < 768;
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth < 768;
  });

  // --- Frame Image Caches ---
  const heroImages = new Array(CONFIG.hero.frameCount + 1);
  const dismantleImages = new Array(CONFIG.dismantle.frameCount + 1);

  let lastDrawnHeroImg = null;
  let lastDrawnDismantleImg = null;

  // ==========================================================================
  // 1. FILM GRAIN OVERLAY
  // ==========================================================================
  function initFilmGrain() {
    const canvas = document.getElementById('film-grain');
    if (!canvas || !CONFIG.grain.enabled || isReducedMotion) return;

    const ctx = canvas.getContext('2d');
    const tileSize = CONFIG.grain.tileSize;

    const offscreen = document.createElement('canvas');
    offscreen.width = tileSize;
    offscreen.height = tileSize;
    const offCtx = offscreen.getContext('2d');

    function generateNoiseTile() {
      const imgData = offCtx.createImageData(tileSize, tileSize);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;     // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
        data[i + 3] = 255;
      }
      offCtx.putImageData(imgData, 0, 0);
    }

    generateNoiseTile();

    function resizeGrain() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeGrain();
    window.addEventListener('resize', resizeGrain);

    let lastTime = 0;
    const frameInterval = 1000 / CONFIG.grain.fps;

    function renderGrain(timestamp) {
      if (timestamp - lastTime >= frameInterval) {
        lastTime = timestamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const offsetX = Math.floor(Math.random() * tileSize);
        const offsetY = Math.floor(Math.random() * tileSize);

        ctx.save();
        ctx.translate(-offsetX, -offsetY);
        const pattern = ctx.createPattern(offscreen, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(offsetX, offsetY, canvas.width + tileSize, canvas.height + tileSize);
        ctx.restore();
      }
      requestAnimationFrame(renderGrain);
    }

    requestAnimationFrame(renderGrain);
  }

  // ==========================================================================
  // 2. CUSTOM CURSOR ("THE HEADLIGHT")
  // ==========================================================================
  function initCustomCursor() {
    if (!hasFinePointer || isReducedMotion) return;

    const cursor = document.getElementById('custom-cursor');
    const labelEl = document.getElementById('cursor-label');
    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    window.addEventListener('mousedown', () => {
      document.body.classList.add('cursor-active');
      setTimeout(() => {
        document.body.classList.remove('cursor-active');
      }, CONFIG.cursor.clickFlashDurationMs);
    });

    function updateCursor() {
      curX += (mouseX - curX) * CONFIG.cursor.lerp;
      curY += (mouseY - curY) * CONFIG.cursor.lerp;

      cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);

    function updateHoverState(e) {
      const target = e.target.closest('a, button, [data-cursor], .lineup-slide, input, .chapter-link');
      if (target) {
        document.body.classList.add('cursor-hover');
        let label = target.getAttribute('data-cursor') || 'VIEW';

        if (target.classList.contains('lineup-slide')) {
          const isOpen = target.getAttribute('aria-expanded') === 'true';
          label = isOpen ? 'CONFIGURE' : 'OPEN';
        }

        if (labelEl) labelEl.textContent = label;
      } else {
        document.body.classList.remove('cursor-hover');
      }
    }

    document.addEventListener('mouseover', updateHoverState);
  }

  // ==========================================================================
  // 3. ROBUST CONCURRENT FRAME LOADER & PRELOADER
  // ==========================================================================
  function loadSingleFrame(src) {
    return new Promise((resolve) => {
      const img = new Image();
      let resolved = false;

      function onDone(result) {
        if (!resolved) {
          resolved = true;
          resolve(result);
        }
      }

      img.onload = () => {
        if (img.decode) {
          img.decode().then(() => onDone(img)).catch(() => onDone(img));
        } else {
          onDone(img);
        }
      };

      img.onerror = () => {
        onDone(null);
      };

      img.src = src;

      // Handle cached images immediately
      if (img.complete && img.naturalWidth > 0) {
        onDone(img);
      }
    });
  }

  // Priority queue for fast parallel frame downloads
  const MAX_CONCURRENT_DOWNLOADS = 12;
  let activeDownloads = 0;
  const loadQueue = [];
  const queuedSrcs = new Set();

  function queueFrame(src, callback, priority = 10) {
    if (queuedSrcs.has(src)) return;
    queuedSrcs.add(src);
    loadQueue.push({ src, callback, priority });
    loadQueue.sort((a, b) => b.priority - a.priority);
    pumpQueue();
  }

  function pumpQueue() {
    while (activeDownloads < MAX_CONCURRENT_DOWNLOADS && loadQueue.length > 0) {
      const task = loadQueue.shift();
      activeDownloads++;
      loadSingleFrame(task.src).then((img) => {
        activeDownloads--;
        if (task.callback) task.callback(img);
        pumpQueue();
      });
    }
  }

  function boostFramePriority(src) {
    const item = loadQueue.find((task) => task.src === src);
    if (item) {
      item.priority += 50;
      loadQueue.sort((a, b) => b.priority - a.priority);
    }
  }

  function initPreloaderAndBackgroundLoading() {
    const preloader = document.getElementById('preloader');
    const bar = document.getElementById('preloader-bar');
    const counter = document.getElementById('preloader-counter');

    const initialBatchCount = CONFIG.preloader.initialHeroFramesToLoad;
    let loadedCount = 0;

    function updateProgress(count) {
      const pct = Math.min(Math.round((count / initialBatchCount) * 100), 100);
      if (bar) bar.style.width = `${pct}%`;
      if (counter) counter.textContent = String(pct).padStart(3, '0');
      if (preloader) preloader.setAttribute('aria-valuenow', pct);
    }

    // Step 1: Preload anchor frames across both Hero and Dismantle immediately
    // This guarantees that any scrub position has an anchor within 15-20 frames
    const heroAnchors = [1, 20, 40, 60, 80, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600];
    const dismantleAnchors = [1, 15, 30, 50, 75, 100, 125, 150, 175, 200];

    dismantleAnchors.forEach((i) => {
      const path = isMobile ? CONFIG.dismantle.mobilePath(i) : CONFIG.dismantle.desktopPath(i);
      queueFrame(path, (img) => {
        if (img) dismantleImages[i] = img;
      }, 80);
    });

    heroAnchors.forEach((i) => {
      const path = isMobile ? CONFIG.hero.mobilePath(i) : CONFIG.hero.desktopPath(i);
      queueFrame(path, (img) => {
        if (img) heroImages[i] = img;
      }, 90);
    });

    // Step 2: Preload initial hero sequence 1 to initialBatchCount for instant smooth play
    let readyTriggered = false;
    for (let i = 1; i <= initialBatchCount; i++) {
      const path = isMobile ? CONFIG.hero.mobilePath(i) : CONFIG.hero.desktopPath(i);
      queueFrame(path, (img) => {
        if (img) heroImages[i] = img;
        loadedCount++;
        updateProgress(loadedCount);

        if (loadedCount >= Math.floor(initialBatchCount * 0.85) && !readyTriggered) {
          readyTriggered = true;
          // Reveal page
          if (bar) bar.classList.add('flash');
          setTimeout(() => {
            if (preloader) preloader.classList.add('loaded');
            // Queue all remaining frames in both Hero and Dismantle concurrently
            queueAllRemainingFrames();
          }, CONFIG.preloader.accentFlashDurationMs);
        }
      }, 100);
    }
  }

  function queueAllRemainingFrames() {
    // Queue hero frames
    for (let i = 1; i <= CONFIG.hero.frameCount; i++) {
      if (!heroImages[i]) {
        const path = isMobile ? CONFIG.hero.mobilePath(i) : CONFIG.hero.desktopPath(i);
        queueFrame(path, (img) => {
          if (img) heroImages[i] = img;
        }, 20);
      }
    }

    // Queue dismantle frames concurrently
    for (let i = 1; i <= CONFIG.dismantle.frameCount; i++) {
      if (!dismantleImages[i]) {
        const path = isMobile ? CONFIG.dismantle.mobilePath(i) : CONFIG.dismantle.desktopPath(i);
        queueFrame(path, (img) => {
          if (img) dismantleImages[i] = img;
        }, 20);
      }
    }
  }

  // Dynamic priority boost around current scrub target
  function prioritizeSurroundingFrames(imageArray, currentIdx, maxFrames, isHero) {
    const range = 8;
    for (let i = Math.max(1, currentIdx - range); i <= Math.min(maxFrames, currentIdx + range); i++) {
      if (!imageArray[i]) {
        const path = isHero
          ? (isMobile ? CONFIG.hero.mobilePath(i) : CONFIG.hero.desktopPath(i))
          : (isMobile ? CONFIG.dismantle.mobilePath(i) : CONFIG.dismantle.desktopPath(i));
        boostFramePriority(path);
      }
    }
  }

  // Helper to find nearest loaded frame
  function getNearestLoadedFrame(imageArray, targetIdx, maxFrames) {
    if (imageArray[targetIdx]) return imageArray[targetIdx];
    for (let delta = 1; delta < maxFrames; delta++) {
      if (targetIdx - delta >= 1 && imageArray[targetIdx - delta]) {
        return imageArray[targetIdx - delta];
      }
      if (targetIdx + delta <= maxFrames && imageArray[targetIdx + delta]) {
        return imageArray[targetIdx + delta];
      }
    }
    return null;
  }

  // Sizing & drawing helper (cover in landscape, contain in portrait)
  function drawFrameToCanvas(ctx, canvas, img, fadeAlpha = 0) {
    if (!img || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const isLandscape = cw >= ch;
    let drawW, drawH, drawX, drawY;

    if (isLandscape) {
      const scale = Math.max(cw / iw, ch / ih);
      drawW = iw * scale;
      drawH = ih * scale;
      drawX = (cw - drawW) / 2;
      drawY = (ch - drawH) / 2;
    } else {
      const scale = Math.min(cw / iw, ch / ih);
      drawW = iw * scale;
      drawH = ih * scale;
      drawX = (cw - drawW) / 2;
      drawY = (ch - drawH) / 2;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Fade to solid black overlay if in final scrub zone
    if (fadeAlpha > 0) {
      ctx.fillStyle = `rgba(7, 8, 10, ${Math.min(fadeAlpha, 1)})`;
      ctx.fillRect(0, 0, cw, ch);
    }
  }

  // ==========================================================================
  // 4. SECTION 1: HERO PINNED SCROLLYTELLING
  // ==========================================================================
  function initHeroScrollytelling() {
    const wrapper = document.getElementById('hero');
    const stage = document.getElementById('hero-stage');
    const canvas = document.getElementById('hero-canvas');
    const progressBar = document.getElementById('hero-progress-bar');
    const hudChapter = document.getElementById('hud-chapter');
    const hudSpeed = document.getElementById('hud-speed');
    const hudDistance = document.getElementById('hud-distance');

    if (!wrapper || !stage || !canvas) return;

    const ctx = canvas.getContext('2d');
    let targetFrame = 1;
    let currentFrame = 1;
    let lastDrawnFrame = -1;
    let lastFadeAlpha = 0;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = stage.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      lastDrawnFrame = -1;
      if (lastDrawnHeroImg) {
        drawFrameToCanvas(ctx, canvas, lastDrawnHeroImg, lastFadeAlpha);
      }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chapterEls = [
      document.getElementById('chapter-1'),
      document.getElementById('chapter-2'),
      document.getElementById('chapter-3'),
      document.getElementById('chapter-4')
    ];

    function updateHeroScroll() {
      const rect = wrapper.getBoundingClientRect();
      const maxScroll = wrapper.offsetHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(Math.max(-rect.top / maxScroll, 0), 1) : 0;

      targetFrame = Math.round(progress * (CONFIG.hero.frameCount - 1)) + 1;
      prioritizeSurroundingFrames(heroImages, targetFrame, CONFIG.hero.frameCount, true);

      if (progressBar) {
        progressBar.style.transform = `scaleX(${progress})`;
      }

      if (hudSpeed) {
        const speed = Math.round(progress * CONFIG.hero.hud.speedMax);
        hudSpeed.textContent = `${String(speed).padStart(3, '0')} KM/H`;
      }
      if (hudDistance) {
        const dist = (progress * CONFIG.hero.hud.distanceMax).toFixed(1);
        hudDistance.textContent = `${dist} KM`;
      }

      let activeIndex = 1;
      if (progress >= 0.75) activeIndex = 4;
      else if (progress >= 0.45) activeIndex = 3;
      else if (progress >= 0.18) activeIndex = 2;
      else activeIndex = 1;

      if (hudChapter) {
        hudChapter.textContent = `0${activeIndex}`;
      }

      CONFIG.hero.chapters.forEach((ch, idx) => {
        const el = chapterEls[idx];
        if (!el) return;
        const inRange = progress >= ch.start && progress <= ch.end;
        if (inRange) {
          if (!el.classList.contains('active')) {
            el.classList.add('active');
          }
        } else {
          if (el.classList.contains('active')) {
            el.classList.remove('active');
          }
        }
      });

      if (progress > CONFIG.hero.fadeToBlackStart) {
        lastFadeAlpha = (progress - CONFIG.hero.fadeToBlackStart) / (1 - CONFIG.hero.fadeToBlackStart);
      } else {
        lastFadeAlpha = 0;
      }
    }

    window.addEventListener('scroll', updateHeroScroll, { passive: true });
    updateHeroScroll();

    function renderHero() {
      if (!isReducedMotion) {
        currentFrame += (targetFrame - currentFrame) * CONFIG.hero.smoothing;
        const rounded = Math.round(currentFrame);

        if (rounded !== lastDrawnFrame || lastFadeAlpha > 0) {
          const img = getNearestLoadedFrame(heroImages, rounded, CONFIG.hero.frameCount) || lastDrawnHeroImg;
          if (img) {
            drawFrameToCanvas(ctx, canvas, img, lastFadeAlpha);
            lastDrawnHeroImg = img;
            lastDrawnFrame = rounded;
          }
        }
      }
      requestAnimationFrame(renderHero);
    }
    requestAnimationFrame(renderHero);
  }

  // ==========================================================================
  // 5. SECTION 2: STATEMENT (WORD-BY-WORD REVEAL)
  // ==========================================================================
  function initStatementSection() {
    const section = document.getElementById('statement');
    const quoteEl = document.getElementById('statement-quote');
    if (!section || !quoteEl) return;

    const sentence = CONFIG.statement.sentence;
    const words = sentence.split(' ');
    quoteEl.innerHTML = words
      .map((w) => `<span class="statement-word">${w}</span>`)
      .join(' ');

    const wordEls = quoteEl.querySelectorAll('.statement-word');

    function updateStatementScroll() {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      const start = vh * 0.85;
      const end = vh * 0.15;
      const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);

      const totalWords = wordEls.length;
      wordEls.forEach((el, index) => {
        const wordThreshold = index / totalWords;
        const nextThreshold = (index + 1) / totalWords;

        if (progress >= nextThreshold) {
          el.style.opacity = '1';
        } else if (progress > wordThreshold) {
          const ramp = (progress - wordThreshold) / (nextThreshold - wordThreshold);
          el.style.opacity = (0.15 + ramp * 0.85).toFixed(2);
        } else {
          el.style.opacity = '0.15';
        }
      });
    }

    window.addEventListener('scroll', updateStatementScroll, { passive: true });
    updateStatementScroll();
  }

  // ==========================================================================
  // 6. SECTION 3: DISMANTLE PINNED SCROLLYTELLING & CALLOUTS
  // ==========================================================================
  function initDismantleScrollytelling() {
    const wrapper = document.getElementById('dismantle');
    const stage = document.getElementById('dismantle-stage');
    const canvas = document.getElementById('dismantle-canvas');
    const progressBar = document.getElementById('dismantle-progress-bar');
    const mobileBadge = document.getElementById('dismantle-mobile-badge');
    const mobileTag = document.getElementById('mobile-badge-tag');
    const mobileDesc = document.getElementById('mobile-badge-desc');

    if (!wrapper || !stage || !canvas) return;

    const ctx = canvas.getContext('2d');
    let targetFrame = 1;
    let currentFrame = 1;
    let lastDrawnFrame = -1;

    // Callout elements mapping defined first
    const calloutMap = {
      body: document.getElementById('callout-body'),
      battery: document.getElementById('callout-battery'),
      drive: document.getElementById('callout-drive'),
      light: document.getElementById('callout-light')
    };

    function updateCalloutPositions() {
      const stageRect = stage.getBoundingClientRect();
      const sw = stageRect.width;
      const sh = stageRect.height;

      CONFIG.dismantle.callouts.forEach((item) => {
        const el = calloutMap[item.id];
        if (!el) return;

        const dotEl = el.querySelector('.callout-dot');
        const contentEl = el.querySelector('.callout-content');
        const lineEl = el.querySelector('.callout-line line');

        const dotX = sw * (item.dot.x / 100);
        const dotY = sh * (item.dot.y / 100);

        const textX = sw * (item.label.x / 100);
        const textY = sh * (item.label.y / 100);

        if (dotEl) {
          dotEl.style.left = `${dotX}px`;
          dotEl.style.top = `${dotY}px`;
        }

        if (contentEl) {
          contentEl.style.left = `${textX}px`;
          contentEl.style.top = `${textY}px`;
        }

        if (lineEl && !isMobile) {
          lineEl.setAttribute('x1', dotX);
          lineEl.setAttribute('y1', dotY);
          lineEl.setAttribute('x2', textX);
          lineEl.setAttribute('y2', textY);
        }
      });
    }

    function resizeDismantleCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = stage.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      lastDrawnFrame = -1;
      updateCalloutPositions();
      const img = getNearestLoadedFrame(dismantleImages, Math.round(currentFrame), CONFIG.dismantle.frameCount) || lastDrawnDismantleImg;
      if (img) {
        drawFrameToCanvas(ctx, canvas, img);
        lastDrawnDismantleImg = img;
      }
    }
    resizeDismantleCanvas();
    window.addEventListener('resize', resizeDismantleCanvas);

    function updateDismantleScroll() {
      const rect = wrapper.getBoundingClientRect();
      const maxScroll = wrapper.offsetHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(Math.max(-rect.top / maxScroll, 0), 1) : 0;

      targetFrame = Math.round(progress * (CONFIG.dismantle.frameCount - 1)) + 1;
      prioritizeSurroundingFrames(dismantleImages, targetFrame, CONFIG.dismantle.frameCount, false);

      if (progressBar) {
        progressBar.style.transform = `scaleX(${progress})`;
      }

      // Desktop Callouts: reveal sequentially in designated quadrants
      let latestActiveCallout = null;
      CONFIG.dismantle.callouts.forEach((item) => {
        const el = calloutMap[item.id];
        if (!el) return;

        if (progress >= item.start) {
          if (!el.classList.contains('active')) el.classList.add('active');
          latestActiveCallout = item;
        } else {
          if (el.classList.contains('active')) el.classList.remove('active');
        }
      });

      // Mobile Single Badge Update (prevents any overlapping cards)
      if (mobileBadge) {
        if (latestActiveCallout && isMobile) {
          mobileBadge.classList.remove('hidden');
          if (mobileTag) mobileTag.textContent = latestActiveCallout.title;
          if (mobileDesc) mobileDesc.textContent = latestActiveCallout.desc;
        } else {
          mobileBadge.classList.add('hidden');
        }
      }
    }

    window.addEventListener('scroll', updateDismantleScroll, { passive: true });
    updateDismantleScroll();

    function renderDismantle() {
      if (!isReducedMotion) {
        currentFrame += (targetFrame - currentFrame) * CONFIG.dismantle.smoothing;
        const rounded = Math.round(currentFrame);

        if (rounded !== lastDrawnFrame) {
          const img = getNearestLoadedFrame(dismantleImages, rounded, CONFIG.dismantle.frameCount) || lastDrawnDismantleImg;
          if (img) {
            drawFrameToCanvas(ctx, canvas, img);
            lastDrawnDismantleImg = img;
            lastDrawnFrame = rounded;
          }
        }
      }
      requestAnimationFrame(renderDismantle);
    }
    requestAnimationFrame(renderDismantle);
  }

  // ==========================================================================
  // 7. SECTION 4: LINEUP (HOVER ACCORDION & COLOR SWATCHES)
  // ==========================================================================
  function initLineupAccordion() {
    const section = document.getElementById('lineup');
    const slides = Array.from(document.querySelectorAll('.lineup-slide'));
    if (!section || slides.length === 0) return;

    let hoverTimeout = null;

    function openSlide(targetSlide) {
      if (!targetSlide || targetSlide.getAttribute('aria-expanded') === 'true') return;

      slides.forEach((slide) => {
        const isTarget = slide === targetSlide;
        slide.setAttribute('aria-expanded', isTarget ? 'true' : 'false');
        slide.setAttribute('data-cursor', isTarget ? 'CONFIGURE' : 'OPEN');
      });
    }

    slides.forEach((slide, idx) => {
      slide.addEventListener('mouseenter', () => {
        if (isMobile) return;
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          openSlide(slide);
        }, CONFIG.lineup.hoverDebounceMs);
      });

      slide.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
      });

      slide.addEventListener('click', (e) => {
        if (e.target.closest('.color-swatch') || e.target.closest('.configure-link')) return;
        openSlide(slide);
      });

      slide.addEventListener('keydown', (e) => {
        let nextIdx = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIdx = (idx + 1) % slides.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIdx = (idx - 1 + slides.length) % slides.length;
        }

        if (nextIdx !== -1) {
          e.preventDefault();
          slides[nextIdx].focus();
          openSlide(slides[nextIdx]);
        }
      });

      const swatches = slide.querySelectorAll('.color-swatch');
      swatches.forEach((swatch) => {
        swatch.addEventListener('click', (e) => {
          e.stopPropagation();
          swatches.forEach((s) => s.classList.remove('active'));
          swatch.classList.add('active');
        });
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('in-view');
            observer.unobserve(section);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(section);
  }

  // ==========================================================================
  // 8. NAVIGATION (HIDE ON SCROLL DOWN, SHOW ON SCROLL UP)
  // ==========================================================================
  function initNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        nav.classList.add('nav-hidden');
      } else {
        nav.classList.remove('nav-hidden');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // ==========================================================================
  // 9. RESERVE BUTTON INTERACTIONS
  // ==========================================================================
  function initReserveButton() {
    const btn = document.getElementById('reserve-cta');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.style.transform = 'scale(0.98)';
      setTimeout(() => {
        btn.style.transform = 'none';
        alert('NOCTIS Allocation: Direct reservation portal opens for 2026 build slots.');
      }, 150);
    });
  }

  // ==========================================================================
  // INITIALIZATION ON DOM READY
  // ==========================================================================
  function init() {
    initFilmGrain();
    initCustomCursor();
    initNavbar();
    initPreloaderAndBackgroundLoading();
    initHeroScrollytelling();
    initStatementSection();
    initDismantleScrollytelling();
    initLineupAccordion();
    initReserveButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

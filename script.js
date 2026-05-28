/* ═══════════════════════════════════════════════════════════════════
   INCEPTION — IMMERSIVE TRIBUTE
   Scroll-driven scene logic, smooth scrolling, and interactions.
   ═══════════════════════════════════════════════════════════════════ */

(() => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));

  gsap.registerPlugin(ScrollTrigger);

  // ─────────────────────────────────────────
  // LENIS SMOOTH SCROLL
  // ─────────────────────────────────────────
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.2,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Lenis is started but stopped during the loader.
  lenis.stop();
  document.documentElement.classList.add("lenis", "lenis-smooth");

  // ─────────────────────────────────────────
  // CUSTOM CURSOR
  // ─────────────────────────────────────────
  const cursor = $("#cursor");
  const cursorRing = $("#cursorRing");
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ring = { x: mouse.x, y: mouse.y };

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    cursor.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%,-50%)`;
  });
  const renderCursor = () => {
    ring.x = lerp(ring.x, mouse.x, 0.18);
    ring.y = lerp(ring.y, mouse.y, 0.18);
    cursorRing.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(-50%,-50%)`;
    requestAnimationFrame(renderCursor);
  };
  renderCursor();

  $$("a, button, .totem3d--giant, .card, .magnetic").forEach((el) => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("is-hover"));
  });
  window.addEventListener("mousedown", () => cursorRing.classList.add("is-click"));
  window.addEventListener("mouseup",   () => cursorRing.classList.remove("is-click"));

  // ─────────────────────────────────────────
  // MAGNETIC BUTTONS
  // ─────────────────────────────────────────
  $$("[data-magnetic]").forEach((btn) => {
    const inner = btn.querySelector(".magnetic__inner") || btn;
    const strength = 0.35;
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
      inner.style.transform = `translate(${dx * 0.5}px, ${dy * 0.5}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
      inner.style.transform = "";
    });
  });

  // ─────────────────────────────────────────
  // SCROLL PROGRESS BAR
  // ─────────────────────────────────────────
  const progressFill = $("#scrollProgress");

  // ─────────────────────────────────────────
  // STARFIELD CANVAS (hero) — toned for light
  // ─────────────────────────────────────────
  const canvas = $("#starfield");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let stars = [];
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const N = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 5000);
      stars = Array.from({ length: N }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight * 0.7,
        r: Math.random() * 1.3 + 0.2,
        baseAlpha: Math.random() * 0.4 + 0.2,
        twinkleSpeed: 0.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
      }));
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawStars = (t) => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      stars.forEach((s) => {
        const a = s.baseAlpha * (0.5 + 0.5 * Math.abs(Math.sin(t * 0.001 * s.twinkleSpeed + s.phase)));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(60, 40, 10, ${a})`;
        ctx.fill();
      });
      requestAnimationFrame(drawStars);
    };
    requestAnimationFrame(drawStars);
  }

  // ─────────────────────────────────────────
  // NEURAL NETWORK (idea section)
  // ─────────────────────────────────────────
  const neuralNodes = $(".neural__nodes");
  const neuralLines = $(".neural__lines");
  if (neuralNodes && neuralLines) {
    const W = 1200, H = 800;
    const N = 32;
    const pts = Array.from({ length: N }, () => ({
      x: 60 + Math.random() * (W - 120),
      y: 60 + Math.random() * (H - 120),
      r: 2 + Math.random() * 5,
    }));
    pts.forEach((p, i) => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p.x);
      c.setAttribute("cy", p.y);
      c.setAttribute("r", p.r);
      c.style.opacity = 0;
      c.style.transformOrigin = `${p.x}px ${p.y}px`;
      neuralNodes.appendChild(c);
      gsap.to(c, {
        opacity: 1,
        delay: i * 0.06,
        duration: 1.4,
        scrollTrigger: { trigger: ".idea", start: "top 75%" },
      });
      gsap.to(c, {
        scale: 1.6,
        repeat: -1,
        yoyo: true,
        duration: 2 + Math.random() * 2,
        ease: "sine.inOut",
        delay: Math.random() * 2,
      });
    });
    pts.forEach((p, i) => {
      const nearest = pts
        .map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) }))
        .filter((d) => d.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      nearest.forEach(({ j }) => {
        if (j <= i) return;
        const q = pts[j];
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", p.x);
        l.setAttribute("y1", p.y);
        l.setAttribute("x2", q.x);
        l.setAttribute("y2", q.y);
        l.style.strokeDasharray = "1000";
        l.style.strokeDashoffset = "1000";
        neuralLines.appendChild(l);
        gsap.to(l, {
          strokeDashoffset: 0,
          duration: 2.2,
          scrollTrigger: { trigger: ".idea", start: "top 65%" },
          ease: "power2.out",
          delay: 0.4 + Math.random() * 1.2,
        });
      });
    });
  }

  // ─────────────────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────────────────
  const loader = $("#loader");
  const loaderFill = $("#loaderFill");
  const loaderHint = $(".loader__hint");
  let loaderProgress = 0;
  let loaderReady = false;

  const tickLoader = () => {
    loaderProgress = Math.min(100, loaderProgress + 1 + Math.random() * 4);
    loaderFill.style.width = `${loaderProgress}%`;
    if (loaderProgress < 100) {
      setTimeout(tickLoader, 60 + Math.random() * 80);
    } else {
      loaderReady = true;
      loaderHint.classList.add("is-ready");
    }
  };
  tickLoader();

  const dismissLoader = () => {
    if (!loaderReady) return;
    loader.classList.add("is-done");
    lenis.start();
    setTimeout(() => {
      $("#depthMeter").classList.add("is-visible");
      $("#kickTimer").classList.add("is-visible");
    }, 600);
  };
  loader.addEventListener("click", dismissLoader);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") dismissLoader();
  });
  setTimeout(() => { loaderReady = true; loaderHint.classList.add("is-ready"); }, 2200);

  // ─────────────────────────────────────────
  // HERO PARALLAX
  // ─────────────────────────────────────────
  $$(".hero__layer, .hero__totem-wrap").forEach((el) => {
    const speed = parseFloat(el.dataset.speed || "0.3");
    gsap.to(el, {
      yPercent: -50 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  gsap.to(".hero__center", {
    yPercent: 40,
    opacity: 0.1,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // hero sun — scale up on scroll
  gsap.to(".hero__sun-ring", {
    scale: 1.8,
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // ─────────────────────────────────────────
  // COUNT-UP NUMBERS
  // ─────────────────────────────────────────
  const countUp = (el) => {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    const end = parseFloat(el.dataset.count || "0");
    const suffix = el.dataset.suffix || "";
    if (suffix === "∞") { el.textContent = "∞"; return; }
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 2, ease: "power2.out",
      onUpdate: () => { el.textContent = Math.round(obj.v).toString() + suffix; },
    });
  };
  $$("[data-count]").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => countUp(el),
    });
  });

  // Stagger reveal idea__stat cards
  $$(".idea__stat").forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      onEnter: () => {
        setTimeout(() => el.classList.add("is-in"), i * 120);
      },
    });
  });

  // ─────────────────────────────────────────
  // IDEA REVEAL
  // ─────────────────────────────────────────
  ScrollTrigger.create({
    trigger: ".idea__heading",
    start: "top 78%",
    onEnter: () => $(".idea__heading").classList.add("is-in"),
  });

  // ─────────────────────────────────────────
  // ARCHITECT — split heading into letters
  // ─────────────────────────────────────────
  const arHeading = $(".architect__heading");
  if (arHeading && arHeading.dataset.split) {
    const text = arHeading.dataset.split;
    arHeading.innerHTML = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.textContent = ch === " " ? " " : ch;
      s.style.display = "inline-block";
      arHeading.appendChild(s);
    });
    const letters = arHeading.querySelectorAll("span");
    gsap.from(letters, {
      yPercent: 100,
      opacity: 0,
      rotateZ: -10,
      duration: 1,
      stagger: 0.06,
      ease: "back.out(1.4)",
      scrollTrigger: { trigger: arHeading, start: "top 80%" },
    });
    // playful drift on scrub
    letters.forEach((s, i) => {
      gsap.to(s, {
        yPercent: (i % 2 === 0 ? -6 : 6),
        ease: "none",
        scrollTrigger: {
          trigger: ".architect",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });
  }

  // Paris fold scrub
  gsap.fromTo(".paris__top", { rotateX: 180 }, {
    rotateX: 90, ease: "none",
    scrollTrigger: {
      trigger: ".architect", start: "top top", end: "bottom bottom", scrub: 0.6,
    },
  });
  gsap.fromTo(".paris__rail", { width: "0%", left: "50%" }, {
    width: "100%", left: "0%",
    scrollTrigger: { trigger: ".architect", start: "top 80%", end: "top 20%", scrub: true },
  });

  // Penrose tilts faster with scroll
  gsap.to(".penrose", {
    rotateZ: 360, ease: "none",
    scrollTrigger: { trigger: ".architect", start: "top bottom", end: "bottom top", scrub: 1 },
  });

  // ─────────────────────────────────────────
  // DREAM LAYERS — parallax content
  // ─────────────────────────────────────────
  $$(".layer").forEach((layer, idx) => {
    const bg = layer.querySelector(".layer__bg");
    const content = layer.querySelector(".layer__content");
    const title = layer.querySelector(".layer__title");

    if (bg) {
      gsap.to(bg, {
        yPercent: -22, scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: layer, start: "top bottom", end: "bottom top", scrub: true,
        },
      });
    }

    gsap.fromTo(content, { yPercent: 60, opacity: 0 }, {
      yPercent: 0, opacity: 1, ease: "power2.out",
      scrollTrigger: { trigger: layer, start: "top 70%", end: "top 30%", scrub: 1 },
    });
    gsap.to(content, {
      yPercent: -40, opacity: 0, ease: "power2.in",
      scrollTrigger: { trigger: layer, start: "bottom 70%", end: "bottom 20%", scrub: 1 },
    });

    if (title) {
      gsap.fromTo(title, { letterSpacing: "0.2em" }, {
        letterSpacing: "-0.02em", ease: "none",
        scrollTrigger: { trigger: layer, start: "top 80%", end: "top 30%", scrub: 1 },
      });
    }
  });

  // ─────────────────────────────────────────
  // DEPTH METER + KICK TIMER + PROGRESS BAR
  // ─────────────────────────────────────────
  const depthFill = $("#depthFill");
  const kickTime = $("#kickTime");
  const kickStart = performance.now();

  const fmtTime = (ms) => {
    const total = Math.max(0, ms);
    const h = Math.floor(total / 3600000);
    const m = Math.floor((total % 3600000) / 60000);
    const s = Math.floor((total % 60000) / 1000);
    const cs = Math.floor((total % 1000) / 10);
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(cs).padStart(2,"0")}`;
  };
  const updateDepthAndTimer = () => {
    const scrollEl = document.documentElement;
    const max = scrollEl.scrollHeight - window.innerHeight;
    const p = clamp(window.scrollY / Math.max(1, max), 0, 1);
    depthFill.style.height = `${p * 100}%`;
    if (progressFill) progressFill.style.width = `${p * 100}%`;
    const elapsed = performance.now() - kickStart;
    const dilated = elapsed * (1 + p * 14);
    kickTime.textContent = fmtTime(dilated);
    requestAnimationFrame(updateDepthAndTimer);
  };
  requestAnimationFrame(updateDepthAndTimer);

  // ─────────────────────────────────────────
  // INTERACTIVE TOTEM
  // ─────────────────────────────────────────
  const totemBig = $("#totemBig");
  const totemCta = $("#totemCta");
  const totemReadout = $("#totemReadout");
  const totemQ = $("#totemQ");
  const totemStage = $("#totemStage");
  const ctaInner = (totemCta && totemCta.querySelector(".magnetic__inner")) || totemCta;

  // ── TOTEM STABILITY GAME ──
  // The top spins; its energy decays ever faster the deeper you dream.
  // Tap the totem (or press Space) to feed it energy and stay under.
  const tg = {
    fill: $("#tgFill"), depth: $("#tgDepth"), level: $("#tgLevel"),
    best: $("#tgBest"), hint: $("#tgHint"), panel: $("#tgame"),
  };
  const TG_BEST_KEY = "inception_totem_best";
  let tgPlaying = false, tgEnergy = 0, tgSurvived = 0, tgLast = 0, tgRAF = null, tgCritical = false, tgAngle = 0;
  let tgBest = parseFloat(localStorage.getItem(TG_BEST_KEY) || "0") || 0;

  const fxCrit = document.createElement("div");
  fxCrit.className = "fx-crit";
  document.body.appendChild(fxCrit);
  if (tg.best) tg.best.textContent = tgBest.toFixed(1) + "s";

  const LEVELS = [
    { t: 0, name: "REALITY" }, { t: 6, name: "THE CITY" }, { t: 14, name: "THE HOTEL" },
    { t: 24, name: "THE FORTRESS" }, { t: 36, name: "LIMBO" },
  ];
  const levelFor = (s) => LEVELS.reduce((acc, l) => (s >= l.t ? l.name : acc), LEVELS[0].name);

  // Spin is driven manually so we can change speed smoothly without
  // restarting the CSS keyframe every frame.
  const tgFrame = (now) => {
    if (!tgPlaying) return;
    const dt = Math.min(0.05, (now - tgLast) / 1000 || 0);
    tgLast = now;
    tgSurvived += dt;
    const decay = 9 + tgSurvived * 0.55;       // accelerates with depth
    tgEnergy = clamp(tgEnergy - decay * dt, 0, 100);
    // rotate: 70°/s when nearly dead → 760°/s at full energy
    const speed = lerp(70, 760, clamp(tgEnergy / 100, 0, 1));
    tgAngle = (tgAngle + speed * dt) % 360;
    totemBig.style.transform = `rotateY(${tgAngle.toFixed(1)}deg)`;
    if (tg.fill) tg.fill.style.width = tgEnergy.toFixed(1) + "%";
    if (tg.depth) tg.depth.textContent = tgSurvived.toFixed(1) + "s";
    if (tg.level) tg.level.textContent = levelFor(tgSurvived);
    const crit = tgEnergy < 26;
    if (crit !== tgCritical) {
      tgCritical = crit;
      document.body.classList.toggle("dream-critical", crit);
      fxCrit.style.opacity = crit ? "1" : "0";
      totemReadout.textContent = crit ? "— DESTABILIZING —" : "— SPINNING —";
      totemReadout.style.color = crit ? "var(--crimson)" : "var(--gold-bright)";
    }
    if (tgEnergy <= 0) { tgEnd(); return; }
    tgRAF = requestAnimationFrame(tgFrame);
  };

  const tgStart = () => {
    tgPlaying = true; tgEnergy = 72; tgSurvived = 0; tgLast = performance.now(); tgCritical = false;
    document.body.classList.remove("dream-critical");
    fxCrit.style.opacity = "0";
    totemBig.classList.remove("is-stopped", "is-wobble", "is-slowing");
    void totemBig.offsetWidth;
    totemBig.style.animation = "none";   // take over the spin manually
    tgAngle = 0;
    totemBig.style.transform = "rotateY(0deg)";
    totemReadout.textContent = "— SPINNING —";
    totemReadout.style.color = "var(--gold-bright)";
    totemQ.textContent = "Keep it spinning. Don't let yourself wake.";
    if (ctaInner) ctaInner.textContent = "BOOST";
    if (tg.panel) tg.panel.classList.add("is-playing");
    if (tg.hint) tg.hint.textContent = "TAP THE TOTEM · OR PRESS SPACE · KEEP IT SPINNING";
    totemStage && totemStage.classList.add("is-spinning");
    const A = window.__incAudio;
    if (A) { A.ensure(); A.playWhoosh(1.4); A.playBwaam(0.3); }
    cancelAnimationFrame(tgRAF);
    tgRAF = requestAnimationFrame(tgFrame);
  };

  const tgBoost = () => {
    if (!tgPlaying) { tgStart(); return; }
    tgEnergy = clamp(tgEnergy + 13, 0, 100);
    const A = window.__incAudio;
    if (A) { A.playWhoosh(1 + tgEnergy / 120); A.playTick(700 + tgEnergy * 6, 0.05); }
    if (totemBig.animate) {
      totemBig.animate([{ filter: "brightness(1.7)" }, { filter: "brightness(1)" }],
        { duration: 200, easing: "ease-out" });
    }
  };

  const tgEnd = () => {
    tgPlaying = false;
    cancelAnimationFrame(tgRAF);
    document.body.classList.remove("dream-critical");
    fxCrit.style.opacity = "0";
    tgCritical = false;
    totemBig.classList.add("is-stopped");
    totemBig.style.transform = "";
    totemBig.style.animation = "totemFall 0.8s cubic-bezier(0.4,0,1,1) forwards";
    totemStage && totemStage.classList.remove("is-spinning");
    if (tg.panel) tg.panel.classList.remove("is-playing");
    totemReadout.textContent = "— FALLEN —";
    totemReadout.style.color = "var(--crimson)";
    totemQ.textContent = "It fell. You woke up.";
    const reached = tgSurvived;
    if (reached > tgBest) {
      tgBest = reached;
      localStorage.setItem(TG_BEST_KEY, tgBest.toFixed(2));
      if (tg.best) tg.best.textContent = tgBest.toFixed(1) + "s";
      if (tg.hint) tg.hint.textContent = `NEW BEST · ${reached.toFixed(1)}s UNDER · CLICK TO DIVE AGAIN`;
    } else if (tg.hint) {
      tg.hint.textContent = `YOU LASTED ${reached.toFixed(1)}s · CLICK THE TOTEM TO DIVE AGAIN`;
    }
    if (ctaInner) ctaInner.textContent = "DREAM AGAIN";
    const A = window.__incAudio;
    if (A) { A.ensure(); A.playBwaam(0.8); }
  };

  totemBig && totemBig.addEventListener("click", tgBoost);
  totemCta && totemCta.addEventListener("click", (e) => { e.preventDefault(); tgBoost(); });
  window.addEventListener("keydown", (e) => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (!totemStage) return;
    const r = totemStage.getBoundingClientRect();
    const inView = r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15;
    if (inView) { e.preventDefault(); tgBoost(); }
  });
  if (tg.panel) {
    ScrollTrigger.create({ trigger: ".totem", start: "top 70%", onEnter: () => tg.panel.classList.add("is-in") });
  }

  // Pin the totem and rotate ring on scroll
  gsap.to(".totem__rings", {
    rotate: 180, ease: "none",
    scrollTrigger: { trigger: ".totem", start: "top bottom", end: "bottom top", scrub: 1 },
  });

  // ─────────────────────────────────────────
  // QUOTES REVEAL — staggered with translate
  // ─────────────────────────────────────────
  $$(".q").forEach((q) => {
    ScrollTrigger.create({
      trigger: q,
      start: "top 82%",
      onEnter: () => q.classList.add("is-in"),
    });
  });

  // ─────────────────────────────────────────
  // CARDS — staggered entrance + tilt on hover
  // ─────────────────────────────────────────
  $$(".card").forEach((card, i) => {
    gsap.from(card, {
      y: 60, opacity: 0,
      duration: 0.9,
      delay: (i % 4) * 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 90%" },
    });
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width  - 0.5;
      const cy = (e.clientY - r.top)  / r.height - 0.5;
      card.style.setProperty("--tx", `${cx * 10}deg`);
      card.style.setProperty("--ty", `${-cy * 10}deg`);
    });
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--tx", "0deg");
      card.style.setProperty("--ty", "0deg");
    });
  });

  // ─────────────────────────────────────────
  // SCENES — pinned horizontal scroll
  // ─────────────────────────────────────────
  const scenesSection = $("#scenes");
  const scenesTrack = $("#scenesTrack");
  const scenesFill = $("#scenesFill");
  const scenesLabel = $("#scenesLabel");
  if (scenesSection && scenesTrack) {
    const scenes = $$(".scene", scenesTrack);
    const total = scenes.length;
    const setHeight = () => {
      const trackW = scenesTrack.scrollWidth;
      const distance = Math.max(0, trackW - window.innerWidth + 56);
      // total scroll = 1 viewport for entry + distance for horizontal travel
      scenesSection.style.height = `${window.innerHeight + distance + 80}px`;
      return distance;
    };
    let distance = setHeight();
    window.addEventListener("resize", () => { distance = setHeight(); ScrollTrigger.refresh(); });

    const horiz = gsap.to(scenesTrack, {
      x: () => -distance,
      ease: "none",
      scrollTrigger: {
        trigger: scenesSection,
        start: "top top",
        end: () => `+=${distance}`,
        scrub: 0.8,
        pin: ".scenes__sticky",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          if (scenesFill) scenesFill.style.width = `${Math.max(2, p * 100)}%`;
          if (scenesLabel) {
            const idx = Math.min(total, Math.max(1, Math.round(p * (total - 1)) + 1));
            scenesLabel.textContent = `${String(idx).padStart(2,"0")} / ${String(total).padStart(2,"0")}`;
          }
        },
      },
    });

    // each scene: subtle zoom while it crosses center
    scenes.forEach((s) => {
      gsap.fromTo(s.querySelector(".scene__art"), { scale: 1.04 }, {
        scale: 1, ease: "none",
        scrollTrigger: {
          trigger: s,
          containerAnimation: horiz,
          start: "left right", end: "right left",
          scrub: true,
        },
      });
    });
  }

  // ─────────────────────────────────────────
  // KICK FLASH
  // ─────────────────────────────────────────
  const kickWord = $("#kickWord");
  const kickFlash = $("#kickFlash");
  ScrollTrigger.create({
    trigger: ".kick", start: "top 50%",
    onEnter: () => {
      gsap.fromTo(kickFlash, { opacity: 0 }, { opacity: 0.95, duration: 0.08, yoyo: true, repeat: 1 });
      gsap.fromTo(kickWord, { scale: 4, opacity: 0, rotate: -8 }, {
        scale: 1, opacity: 1, rotate: 0, duration: 1.4, ease: "expo.out",
      });
    },
  });

  // ─────────────────────────────────────────
  // SECTION HEADINGS — parallax y on scroll
  // ─────────────────────────────────────────
  $$(".layers__heading, .totem__heading, .team__heading, .quotes__heading").forEach((h) => {
    gsap.fromTo(h, { yPercent: 20, opacity: 0.5 }, {
      yPercent: -10, opacity: 1, ease: "none",
      scrollTrigger: { trigger: h, start: "top bottom", end: "bottom top", scrub: 1 },
    });
  });

  // ─────────────────────────────────────────
  // NAV ACTIVE STATE
  // ─────────────────────────────────────────
  const sections = ["idea", "architect", "layers", "totem", "team"];
  const navLinks = $$(".ui-top__nav a");
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => {
        if (self.isActive) {
          navLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.section === id));
        }
      },
    });
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href");
      const target = document.querySelector(id);
      if (target) lenis.scrollTo(target, { offset: -40, duration: 1.6 });
    });
  });

  // Wake up / back to top
  const wake = (e) => {
    if (e) e.preventDefault();
    lenis.scrollTo(0, { duration: 2.4 });
  };
  $("#kickWake")?.addEventListener("click", wake);
  $("#backToTop")?.addEventListener("click", wake);

  // ─────────────────────────────────────────
  // CINEMATIC AUDIO ENGINE (all synthesized)
  // Evokes the soundscape via WebAudio — no copyrighted material.
  //   • Sub-bass drone with detuned voices + slow LFO swell
  //   • Brass-stack BWAAAM (FM-style, 3 octaves, lowpass sweep)
  //   • Reverse cymbal/snare swell for section entries
  //   • Heartbeat sub thump that pulses with depth
  //   • Convolver "room" reverb built from procedural noise
  //   • Slow tempo-stretched brass figure for kick countdown
  // ─────────────────────────────────────────
  const audioBtn = $("#audioToggle");
  let audioCtx = null;
  let masterGain = null;
  let droneGain = null;
  let droneVoices = [];
  let convolver = null, reverbReturn = null;
  let heartbeatInterval = null;
  let audioOn = false;
  audioBtn.classList.add("is-off");

  const makeImpulse = (ctx, seconds = 2.6, decay = 2.0) => {
    const rate = ctx.sampleRate;
    const len = rate * seconds;
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  };

  const buildAudio = () => {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.9;
    masterGain.connect(audioCtx.destination);

    // Reverb bus
    convolver = audioCtx.createConvolver();
    convolver.buffer = makeImpulse(audioCtx, 3.4, 2.2);
    reverbReturn = audioCtx.createGain();
    reverbReturn.gain.value = 0.35;
    convolver.connect(reverbReturn);
    reverbReturn.connect(masterGain);

    // Drone bus
    droneGain = audioCtx.createGain();
    droneGain.gain.value = 0;
    const droneFilter = audioCtx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.value = 280;
    droneFilter.Q.value = 0.7;
    droneGain.connect(droneFilter);
    droneFilter.connect(masterGain);
    // small send to reverb
    const droneSend = audioCtx.createGain();
    droneSend.gain.value = 0.5;
    droneFilter.connect(droneSend);
    droneSend.connect(convolver);

    // Detuned drone voices — D1 stack with slow chorus
    const baseFreqs = [36.7, 36.95, 55.0, 55.3, 73.4]; // D1, slight detune, A1, A1 detuned, D2
    const types = ["sine", "sine", "sawtooth", "sine", "sine"];
    droneVoices = baseFreqs.map((f, i) => {
      const o = audioCtx.createOscillator();
      o.type = types[i];
      o.frequency.value = f;
      const vg = audioCtx.createGain();
      vg.gain.value = i === 2 ? 0.06 : 0.18; // saw quieter
      o.connect(vg);
      vg.connect(droneGain);
      o.start();
      return { osc: o, gain: vg };
    });

    // Slow swell LFO modulating overall drone gain
    const lfo = audioCtx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.07;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(droneGain.gain);
    lfo.start();

    // Filter sweep LFO — gives breathing texture
    const fLfo = audioCtx.createOscillator();
    fLfo.type = "sine";
    fLfo.frequency.value = 0.03;
    const fLfoGain = audioCtx.createGain();
    fLfoGain.gain.value = 120;
    fLfo.connect(fLfoGain);
    fLfoGain.connect(droneFilter.frequency);
    fLfo.start();
  };

  // Massive cinematic brass blast — stacked oscillators in fifths,
  // sweeping lowpass, hard envelope, fed through reverb.
  const playBwaam = (intensity = 1) => {
    if (!audioCtx) buildAudio();
    const t0 = audioCtx.currentTime;
    const dur = 2.8 + 0.4 * intensity;

    const blastGain = audioCtx.createGain();
    blastGain.gain.setValueAtTime(0.0001, t0);
    blastGain.gain.exponentialRampToValueAtTime(0.55 * intensity, t0 + 0.035);
    blastGain.gain.exponentialRampToValueAtTime(0.25 * intensity, t0 + 0.4);
    blastGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    const filt = audioCtx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.setValueAtTime(1400, t0);
    filt.frequency.exponentialRampToValueAtTime(110, t0 + dur * 0.9);
    filt.Q.value = 6;

    // Fundamental stack: D1, A1, D2, F2 (brass-y power chord feel)
    const fundamentals = [36.7, 55.0, 73.4, 87.3];
    const oscs = [];
    fundamentals.forEach((f, i) => {
      const o1 = audioCtx.createOscillator();
      o1.type = i === 0 ? "sawtooth" : "square";
      o1.frequency.setValueAtTime(f, t0);
      // small bend down
      o1.frequency.exponentialRampToValueAtTime(f * 0.92, t0 + dur);

      const o2 = audioCtx.createOscillator(); // slight detune
      o2.type = "sawtooth";
      o2.frequency.setValueAtTime(f * 1.005, t0);
      o2.frequency.exponentialRampToValueAtTime(f * 0.925, t0 + dur);

      const vg = audioCtx.createGain();
      vg.gain.value = i === 0 ? 0.32 : (i === 1 ? 0.28 : (i === 2 ? 0.18 : 0.10));
      o1.connect(vg);
      o2.connect(vg);
      vg.connect(filt);
      o1.start(t0);
      o2.start(t0);
      o1.stop(t0 + dur + 0.1);
      o2.stop(t0 + dur + 0.1);
      oscs.push(o1, o2);
    });

    // Sub thump (kick layer)
    const sub = audioCtx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(90, t0);
    sub.frequency.exponentialRampToValueAtTime(28, t0 + 0.55);
    const subG = audioCtx.createGain();
    subG.gain.setValueAtTime(0.0001, t0);
    subG.gain.exponentialRampToValueAtTime(0.7 * intensity, t0 + 0.02);
    subG.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
    sub.connect(subG);
    subG.connect(masterGain);
    sub.start(t0);
    sub.stop(t0 + 1);

    // Noise crash for transient bite
    const noiseLen = 0.6;
    const nbuf = audioCtx.createBuffer(1, audioCtx.sampleRate * noiseLen, audioCtx.sampleRate);
    const ndata = nbuf.getChannelData(0);
    for (let i = 0; i < ndata.length; i++) {
      ndata[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ndata.length, 3);
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = nbuf;
    const nFilt = audioCtx.createBiquadFilter();
    nFilt.type = "highpass";
    nFilt.frequency.value = 3500;
    const nG = audioCtx.createGain();
    nG.gain.value = 0.25 * intensity;
    noise.connect(nFilt);
    nFilt.connect(nG);
    nG.connect(masterGain);
    noise.start(t0);

    filt.connect(blastGain);
    blastGain.connect(masterGain);
    // send to reverb
    const send = audioCtx.createGain();
    send.gain.value = 0.6;
    blastGain.connect(send);
    send.connect(convolver);
  };

  // Reverse cymbal swell — used on section reveals
  const playSwell = (duration = 1.6) => {
    if (!audioCtx) buildAudio();
    const t0 = audioCtx.currentTime;
    const len = audioCtx.sampleRate * duration;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (i / len); // ramps in
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const filt = audioCtx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.setValueAtTime(400, t0);
    filt.frequency.exponentialRampToValueAtTime(6000, t0 + duration);
    filt.Q.value = 1.2;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.18, t0 + duration * 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration + 0.1);
    src.connect(filt);
    filt.connect(g);
    g.connect(masterGain);
    g.connect(convolver);
    src.start(t0);
  };

  // Heartbeat thump — pairs of low sine hits
  const playHeartbeat = (intensity = 0.45) => {
    if (!audioCtx || !audioOn) return;
    const t0 = audioCtx.currentTime;
    [0, 0.22].forEach((offset, idx) => {
      const o = audioCtx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(70, t0 + offset);
      o.frequency.exponentialRampToValueAtTime(34, t0 + offset + 0.18);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.0001, t0 + offset);
      g.gain.exponentialRampToValueAtTime(intensity * (idx === 0 ? 1 : 0.7), t0 + offset + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + 0.32);
      o.connect(g);
      g.connect(masterGain);
      o.start(t0 + offset);
      o.stop(t0 + offset + 0.4);
    });
  };

  // Short whoosh — for totem spin / hover events
  const playWhoosh = (pitch = 1) => {
    if (!audioCtx) return;
    const t0 = audioCtx.currentTime;
    const len = audioCtx.sampleRate * 0.6;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - Math.abs(i / len - 0.4), 2);
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const filt = audioCtx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.setValueAtTime(800 * pitch, t0);
    filt.frequency.exponentialRampToValueAtTime(2400 * pitch, t0 + 0.5);
    filt.Q.value = 2;
    const g = audioCtx.createGain();
    g.gain.value = 0.12;
    src.connect(filt);
    filt.connect(g);
    g.connect(masterGain);
    src.start(t0);
  };

  // Tick sound — small percussive click for UI ticks
  const playTick = (freq = 1200, gainVal = 0.06) => {
    if (!audioCtx || !audioOn) return;
    const t0 = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    o.type = "triangle";
    o.frequency.value = freq;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(gainVal, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
    o.connect(g);
    g.connect(masterGain);
    o.start(t0);
    o.stop(t0 + 0.1);
  };

  // Slow stretched brass figure — evokes the tempo-dilation
  // motif that anchors the score, fully original tones.
  const playStretchedBrass = () => {
    if (!audioCtx || !audioOn) return;
    const t0 = audioCtx.currentTime;
    // Descending pair of brass notes spaced far apart
    const notes = [
      { f: 110, at: 0,   dur: 2.2 },
      { f: 82.4, at: 2.0, dur: 2.6 },
    ];
    notes.forEach(({ f, at, dur }) => {
      const o1 = audioCtx.createOscillator();
      const o2 = audioCtx.createOscillator();
      o1.type = "sawtooth"; o2.type = "square";
      o1.frequency.value = f;
      o2.frequency.value = f * 1.005;
      const filt = audioCtx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.setValueAtTime(500, t0 + at);
      filt.frequency.linearRampToValueAtTime(1400, t0 + at + 0.6);
      filt.frequency.linearRampToValueAtTime(300, t0 + at + dur);
      filt.Q.value = 4;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.0001, t0 + at);
      g.gain.linearRampToValueAtTime(0.18, t0 + at + 0.35);
      g.gain.linearRampToValueAtTime(0.0001, t0 + at + dur);
      o1.connect(filt); o2.connect(filt);
      filt.connect(g);
      g.connect(masterGain);
      const send = audioCtx.createGain();
      send.gain.value = 0.4;
      g.connect(send); send.connect(convolver);
      o1.start(t0 + at); o2.start(t0 + at);
      o1.stop(t0 + at + dur + 0.1);
      o2.stop(t0 + at + dur + 0.1);
    });
  };

  // Ticking clock — the relentless pendulum motif (synthesized).
  // A short woody knock alternating high/low, fed lightly to reverb.
  let clockTimer = null;
  const playClock = (high) => {
    if (!audioCtx || !audioOn) return;
    const t0 = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(high ? 320 : 240, t0);
    o.frequency.exponentialRampToValueAtTime(high ? 150 : 110, t0 + 0.04);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.16, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
    // tiny noise click on the transient
    const nb = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.02, audioCtx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nd.length);
    const ns = audioCtx.createBufferSource(); ns.buffer = nb;
    const nf = audioCtx.createBiquadFilter(); nf.type = "highpass"; nf.frequency.value = 2000;
    const ng = audioCtx.createGain(); ng.gain.value = 0.06;
    ns.connect(nf); nf.connect(ng); ng.connect(masterGain);
    o.connect(g); g.connect(masterGain);
    const send = audioCtx.createGain(); send.gain.value = 0.15; g.connect(send); send.connect(convolver);
    o.start(t0); o.stop(t0 + 0.12); ns.start(t0);
  };
  const startClock = () => {
    let hi = false;
    const tick = () => {
      if (!audioOn) return;
      playClock(hi); hi = !hi;
      clockTimer = setTimeout(tick, 600);
    };
    tick();
  };

  // Piano-ish descending motif — gentle, melancholic, fully original.
  const playPiano = () => {
    if (!audioCtx || !audioOn) return;
    const t0 = audioCtx.currentTime;
    const notes = [293.66, 261.63, 220.0, 196.0, 174.61]; // D4 C4 A3 G3 F3 descending
    notes.forEach((f, i) => {
      const at = t0 + i * 0.5;
      const o = audioCtx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const o2 = audioCtx.createOscillator();
      o2.type = "sine"; o2.frequency.value = f / 2;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.13, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 1.4);
      o.connect(g); o2.connect(g); g.connect(masterGain);
      const send = audioCtx.createGain(); send.gain.value = 0.5; g.connect(send); send.connect(convolver);
      o.start(at); o2.start(at); o.stop(at + 1.5); o2.stop(at + 1.5);
    });
  };

  // Collectible chime — bright bell-ish triad for the totem hunt.
  const playCollect = (step = 0) => {
    if (!audioCtx) buildAudio();
    const t0 = audioCtx.currentTime;
    const base = 523.25 * Math.pow(2, step / 12); // climbs a semitone per find
    [1, 1.5, 2].forEach((mult, i) => {
      const o = audioCtx.createOscillator();
      o.type = "sine"; o.frequency.value = base * mult;
      const g = audioCtx.createGain();
      const at = t0 + i * 0.04;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.14 / (i + 1), at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
      o.connect(g); g.connect(masterGain);
      const send = audioCtx.createGain(); send.gain.value = 0.6; g.connect(send); send.connect(convolver);
      o.start(at); o.stop(at + 1);
    });
  };

  audioBtn.addEventListener("click", () => {
    if (!audioCtx) buildAudio();
    if (audioCtx.state === "suspended") audioCtx.resume();
    audioOn = !audioOn;
    audioBtn.classList.toggle("is-off", !audioOn);
    const target = audioOn ? 0.18 : 0;
    droneGain.gain.cancelScheduledValues(audioCtx.currentTime);
    droneGain.gain.linearRampToValueAtTime(target, audioCtx.currentTime + 1.2);

    if (audioOn) {
      // start heartbeat loop — interval shortens with depth (set later)
      const beat = () => {
        const scrollEl = document.documentElement;
        const max = scrollEl.scrollHeight - window.innerHeight;
        const p = clamp(window.scrollY / Math.max(1, max), 0, 1);
        playHeartbeat(0.25 + p * 0.45);
        const next = lerp(1400, 520, p);
        heartbeatInterval = setTimeout(beat, next);
      };
      beat();
      // signature stretched brass intro + ticking clock + piano motif
      setTimeout(() => playStretchedBrass(), 200);
      setTimeout(() => startClock(), 400);
      setTimeout(() => playPiano(), 1600);
    } else {
      clearTimeout(heartbeatInterval);
      clearTimeout(clockTimer);
    }
  });

  // BWAAAM on kick reveal
  let kickFired = false;
  ScrollTrigger.create({
    trigger: ".kick",
    start: "top 40%",
    onEnter: () => {
      if (kickFired || !audioOn) return;
      kickFired = true;
      if (audioCtx.state === "suspended") audioCtx.resume();
      playBwaam(1);
      setTimeout(() => playBwaam(0.7), 900);
      setTimeout(() => playBwaam(0.5), 1700);
    },
  });

  // Smaller BWAAAMs fire when entering each dream layer
  $$(".layer").forEach((layer, idx) => {
    ScrollTrigger.create({
      trigger: layer,
      start: "top 60%",
      onEnter: () => {
        if (!audioOn) return;
        playBwaam(0.3 + idx * 0.1);
      },
    });
  });

  // Reverse swell on each chapter heading
  $$(".eyebrow").forEach((eb) => {
    ScrollTrigger.create({
      trigger: eb,
      start: "top 75%",
      onEnter: () => { if (audioOn) playSwell(1.4); },
    });
  });

  // Expose audio helpers for other modules
  window.__incAudio = {
    playBwaam, playWhoosh, playTick, playSwell, playPiano, playCollect,
    ensure: () => { if (!audioCtx) buildAudio(); if (audioCtx.state === "suspended") audioCtx.resume(); },
    isOn: () => audioOn,
  };

  // ─────────────────────────────────────────
  // CHROMATIC ABERRATION — intensifies with depth
  // ─────────────────────────────────────────
  const fx = document.createElement("div");
  fx.className = "fx-chroma";
  fx.id = "fxChroma";
  document.body.appendChild(fx);

  const scan = document.createElement("div");
  scan.className = "fx-scan";
  document.body.appendChild(scan);

  const vignette = document.createElement("div");
  vignette.className = "fx-vignette";
  document.body.appendChild(vignette);

  let curDepth = 0, tgtDepth = 0;
  const renderFx = () => {
    curDepth = lerp(curDepth, tgtDepth, 0.08);
    const shift = curDepth * 5; // px
    fx.style.setProperty("--chroma", `${shift}px`);
    fx.style.opacity = (curDepth * 0.6).toFixed(3);
    scan.style.opacity = (curDepth * 0.28).toFixed(3);
    vignette.style.opacity = (0.15 + curDepth * 0.55).toFixed(3);
    document.documentElement.style.setProperty("--depth", curDepth.toFixed(3));
    requestAnimationFrame(renderFx);
  };
  requestAnimationFrame(renderFx);

  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => { tgtDepth = self.progress; },
  });

  // ─────────────────────────────────────────
  // CAMERA SHAKE on the BWAAAM kick
  // ─────────────────────────────────────────
  const main = $("#main");
  const cameraShake = (strength = 26, duration = 0.9) => {
    if (!main) return;
    const start = performance.now();
    const dur = duration * 1000;
    const tick = (now) => {
      const t = (now - start) / dur;
      if (t >= 1) { main.style.transform = ""; return; }
      const decay = (1 - t);
      const dx = (Math.random() * 2 - 1) * strength * decay;
      const dy = (Math.random() * 2 - 1) * strength * decay;
      const rot = (Math.random() * 2 - 1) * 1.2 * decay;
      main.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  ScrollTrigger.create({
    trigger: ".kick", start: "top 40%",
    onEnter: () => {
      cameraShake(30, 1.1);
      document.body.classList.add("is-kicking");
      setTimeout(() => cameraShake(16, 0.7), 900);
      setTimeout(() => document.body.classList.remove("is-kicking"), 2000);
    },
  });

  // ─────────────────────────────────────────
  // DREAM DEBRIS — drifting particle field (fixed canvas)
  // ─────────────────────────────────────────
  const debris = document.createElement("canvas");
  debris.className = "fx-debris";
  document.body.appendChild(debris);
  const dctx = debris.getContext("2d");
  let particles = [];
  const resizeDebris = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    debris.width = window.innerWidth * dpr;
    debris.height = window.innerHeight * dpr;
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const N = Math.floor((window.innerWidth * window.innerHeight) / 28000);
    particles = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.12 - Math.random() * 0.5,
      size: Math.random() * 2.4 + 0.5,
      spin: (Math.random() - 0.5) * 0.04,
      rot: Math.random() * Math.PI,
      alpha: Math.random() * 0.35 + 0.08,
    }));
  };
  resizeDebris();
  window.addEventListener("resize", resizeDebris);
  const drawDebris = () => {
    dctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const zg = document.body.classList.contains("zero-g");
    const intensity = 0.4 + curDepth * 1.6;
    const nowMs = performance.now();
    particles.forEach((p) => {
      const sway = zg ? Math.sin((p.y + nowMs * 0.0004) * 0.012) * 0.9 : Math.sin(p.y * 0.01) * 0.2;
      p.x += p.vx * intensity + sway;
      p.y += (zg ? -p.vy * 0.42 : p.vy) * intensity;   // zero-G: gentle reversed drift
      p.rot += p.spin * (zg ? 2.2 : 1);
      if (p.y < -10) { p.y = window.innerHeight + 10; p.x = Math.random() * window.innerWidth; }
      if (p.y > window.innerHeight + 10) { p.y = -10; p.x = Math.random() * window.innerWidth; }
      if (p.x < -10) p.x = window.innerWidth + 10;
      if (p.x > window.innerWidth + 10) p.x = -10;
      dctx.save();
      dctx.translate(p.x, p.y);
      dctx.rotate(p.rot);
      dctx.fillStyle = `rgba(160, 110, 30, ${p.alpha * (0.4 + curDepth)})`;
      dctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      dctx.restore();
    });
    requestAnimationFrame(drawDebris);
  };
  requestAnimationFrame(drawDebris);

  // ─────────────────────────────────────────
  // TEXT SCRAMBLE — decoder reveal on big headings
  // ─────────────────────────────────────────
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ▲◆◇△∞01";
  const scramble = (el, finalText, duration = 1100) => {
    const start = performance.now();
    const original = [...finalText];
    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const revealed = Math.floor(t * original.length);
      let out = "";
      for (let i = 0; i < original.length; i++) {
        if (original[i] === " ") { out += " "; continue; }
        if (i < revealed) out += original[i];
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = finalText;
    };
    requestAnimationFrame(tick);
  };
  $$(".layers__heading, .totem__heading, .team__heading, .quotes__heading, .scenes__heading").forEach((h) => {
    const finalText = h.textContent;
    // preserve inner <em> by only scrambling plain headings
    if (h.querySelector("em")) return;
    let done = false;
    ScrollTrigger.create({
      trigger: h, start: "top 80%",
      onEnter: () => { if (done) return; done = true; scramble(h, finalText, 1000); },
    });
  });

  // ─────────────────────────────────────────
  // HERO TOTEM — 3D tilt that follows the cursor
  // ─────────────────────────────────────────
  const heroTotemTilt = $("#heroTotemTilt");
  if (heroTotemTilt) {
    const heroSection = $(".hero");
    heroSection.addEventListener("mousemove", (e) => {
      const r = heroSection.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      heroTotemTilt.style.setProperty("--rx", `${-cy * 18}deg`);
      heroTotemTilt.style.setProperty("--ry", `${cx * 22}deg`);
    });
    heroSection.addEventListener("mouseleave", () => {
      heroTotemTilt.style.setProperty("--rx", "0deg");
      heroTotemTilt.style.setProperty("--ry", "0deg");
    });
  }

  // ─────────────────────────────────────────
  // HERO TITLE — letters fly in with 3D rotation
  // ─────────────────────────────────────────
  gsap.from(".hero__title span", {
    yPercent: 120, rotateX: -90, opacity: 0,
    transformOrigin: "50% 100%",
    duration: 1.2, stagger: 0.06, ease: "back.out(1.6)",
    delay: 0.3,
  });
  // subtle ongoing float on each title letter
  $$(".hero__title span").forEach((s, i) => {
    gsap.to(s, {
      y: i % 2 ? -8 : 8, duration: 2.4 + i * 0.12,
      repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.1,
    });
  });

  // ─────────────────────────────────────────
  // SCENES — 3D card rotation as they cross center
  // ─────────────────────────────────────────
  // (augments existing horizontal scrub; harmless if scenes absent)
  $$(".scene").forEach((s) => {
    const art = s.querySelector(".scene__art");
    if (!art) return;
    s.addEventListener("mousemove", (e) => {
      const r = art.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      art.style.transform = `perspective(900px) rotateY(${cx * 12}deg) rotateX(${-cy * 12}deg) scale(1.02)`;
    });
    s.addEventListener("mouseleave", () => { art.style.transform = ""; });
  });

  // ─────────────────────────────────────────
  // KICK COUNTDOWN — tick sound near each second
  // ─────────────────────────────────────────
  let lastSecond = -1;
  const kickTimeEl = $("#kickTime");
  if (kickTimeEl) {
    const obs = () => {
      const txt = kickTimeEl.textContent;
      const sec = parseInt(txt.split(":")[2], 10);
      if (!isNaN(sec) && sec !== lastSecond) {
        lastSecond = sec;
        playTick(900 + curDepth * 600, 0.04 + curDepth * 0.04);
      }
      requestAnimationFrame(obs);
    };
    requestAnimationFrame(obs);
  }

  // ─────────────────────────────────────────
  // HIDDEN TOTEM HUNT  →  unlock LIMBO
  // ─────────────────────────────────────────
  const huntHud = $("#huntHud");
  const huntCountEl = $("#huntCount");
  const huntTotalEl = $("#huntTotal");
  const SPOTS = [
    { sel: ".idea__content",     top: "4%",  left: "90%" },
    { sel: ".architect__sticky", top: "14%", left: "6%"  },
    { sel: ".layers__intro",     top: "22%", left: "86%" },
    { sel: ".scenes__head",      top: "2%",  left: "92%" },
    { sel: ".team",              top: "7%",  left: "5%"  },
    { sel: ".quotes",            top: "10%", left: "91%" },
  ];
  let huntFound = 0;
  const huntTotal = SPOTS.length;
  if (huntTotalEl) huntTotalEl.textContent = huntTotal;

  const showLimbo = () => {
    const ov = $("#limboUnlock");
    if (!ov) return;
    ov.classList.add("is-on");
    ov.setAttribute("aria-hidden", "false");
    lenis.stop();
    const A = window.__incAudio;
    if (A) { A.ensure(); A.playBwaam(1); setTimeout(() => A.playPiano && A.playPiano(), 700); }
    document.body.classList.add("is-kicking");
    setTimeout(() => document.body.classList.remove("is-kicking"), 1200);
  };
  $("#limboClose")?.addEventListener("click", () => {
    const ov = $("#limboUnlock");
    ov?.classList.remove("is-on");
    ov?.setAttribute("aria-hidden", "true");
    lenis.start();
  });

  SPOTS.forEach((spot, i) => {
    const host = $(spot.sel);
    if (!host) return;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    const btn = document.createElement("button");
    btn.className = "hidden-totem";
    btn.type = "button";
    btn.setAttribute("aria-label", "Hidden totem");
    btn.textContent = "▲";
    btn.style.top = spot.top;
    btn.style.left = spot.left;
    btn.style.animationDelay = (i * 0.4) + "s";
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-found")) return;
      btn.classList.add("is-found");
      huntFound++;
      if (huntCountEl) huntCountEl.textContent = huntFound;
      if (huntHud) {
        huntHud.classList.add("is-visible", "is-pop");
        setTimeout(() => huntHud.classList.remove("is-pop"), 460);
      }
      const A = window.__incAudio;
      if (A) { A.ensure(); A.playCollect && A.playCollect(huntFound); }
      if (huntFound >= huntTotal) {
        huntHud && huntHud.classList.add("is-complete");
        setTimeout(showLimbo, 700);
      }
    });
    host.appendChild(btn);
  });
  ScrollTrigger.create({
    trigger: ".idea", start: "top 92%",
    onEnter: () => huntHud && huntHud.classList.add("is-visible"),
  });

  // ─────────────────────────────────────────
  // ZERO-G + KEYBOARD CONTROLS + HELP PANEL
  // ─────────────────────────────────────────
  const zerogBadge = $("#zerogBadge");
  const keysToast = $("#keysToast");
  const keysPanel = $("#keysPanel");
  let zeroG = false, zgBadgeTimer = null;

  const setGravity = (on) => {
    zeroG = on;
    document.body.classList.toggle("zero-g", on);
    if (zerogBadge) {
      zerogBadge.classList.add("is-on");
      zerogBadge.textContent = on ? "◌ ZERO GRAVITY" : "▼ GRAVITY RESTORED";
      clearTimeout(zgBadgeTimer);
      zgBadgeTimer = setTimeout(() => zerogBadge.classList.remove("is-on"), 1600);
    }
    const A = window.__incAudio;
    if (A) { A.ensure(); A.playWhoosh(on ? 0.6 : 1.6); A.playBwaam(0.35); }
  };

  const toggleKeys = () => {
    if (!keysPanel) return;
    const on = keysPanel.classList.toggle("is-on");
    keysPanel.setAttribute("aria-hidden", on ? "false" : "true");
  };
  $("#keysClose")?.addEventListener("click", () => {
    keysPanel?.classList.remove("is-on");
    keysPanel?.setAttribute("aria-hidden", "true");
  });

  const SECTION_IDS = ["hero", "idea", "architect", "layers", "scenes", "totem", "team", "quotes", "kick"];
  const currentSectionIndex = () => {
    const mid = window.scrollY + window.innerHeight / 2;
    let idx = 0;
    SECTION_IDS.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= mid) idx = i;
    });
    return idx;
  };
  const goToSection = (idx) => {
    idx = clamp(idx, 0, SECTION_IDS.length - 1);
    const el = document.getElementById(SECTION_IDS[idx]);
    if (el) lenis.scrollTo(el, { offset: -20, duration: 1.4 });
  };

  window.addEventListener("keydown", (e) => {
    if (e.target && e.target.matches && e.target.matches("input, textarea")) return;
    const k = (e.key || "").toLowerCase();
    if (k === "g") { setGravity(!zeroG); }
    else if (k === "h" || k === "?") { e.preventDefault(); toggleKeys(); }
    else if (k === "m") { audioBtn && audioBtn.click(); }
    else if (k === "arrowdown" || k === "j") { e.preventDefault(); goToSection(currentSectionIndex() + 1); }
    else if (k === "arrowup" || k === "k") { e.preventDefault(); goToSection(currentSectionIndex() - 1); }
    else if (k === "escape") {
      keysPanel?.classList.remove("is-on");
      $("#limboUnlock")?.classList.remove("is-on");
      lenis.start();
    }
  });

  // controls toast — shown once, just after the loader is dismissed
  let toastShown = false;
  const showToast = () => {
    if (toastShown || !keysToast) return;
    toastShown = true;
    keysToast.classList.add("is-on");
    setTimeout(() => keysToast.classList.remove("is-on"), 5400);
  };
  loader?.addEventListener("click", () => setTimeout(showToast, 1500));
  window.addEventListener("keydown", function onceToast(e) {
    if (e.key === "Enter" || e.key === " ") {
      setTimeout(showToast, 1500);
      window.removeEventListener("keydown", onceToast);
    }
  });

  // ─────────────────────────────────────────
  // PROJECTION WATCHERS — eyes that track the cursor in deep dreams
  // ─────────────────────────────────────────
  const eyeCanvas = document.createElement("canvas");
  eyeCanvas.className = "fx-eyes";
  document.body.appendChild(eyeCanvas);
  const ectx = eyeCanvas.getContext("2d");
  let eyes = [];
  const resizeEyes = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    eyeCanvas.width = window.innerWidth * dpr;
    eyeCanvas.height = window.innerHeight * dpr;
    ectx.setTransform(dpr, 0, 0, dpr, 0, 0);
    eyes = Array.from({ length: 7 }, () => ({
      x: 0.08 + Math.random() * 0.84,
      y: 0.12 + Math.random() * 0.74,
      r: 11 + Math.random() * 16,
      blink: 1 + Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
    }));
  };
  resizeEyes();
  window.addEventListener("resize", resizeEyes);

  const drawEyes = (t) => {
    const w = window.innerWidth, h = window.innerHeight;
    ectx.clearRect(0, 0, w, h);
    const vis = clamp((curDepth - 0.45) / 0.4, 0, 1);
    eyeCanvas.style.opacity = (vis * 0.55).toFixed(3);
    if (vis > 0.01) {
      eyes.forEach((eye) => {
        const ex = eye.x * w, ey = eye.y * h;
        eye.blink -= 0.016;
        if (eye.blink < 0) eye.blink = 3 + Math.random() * 5;
        const blinkAmt = eye.blink < 0.16 ? Math.abs(Math.sin((eye.blink / 0.16) * Math.PI)) : 1;
        const open = (0.55 + 0.45 * Math.sin(t * 0.001 + eye.phase)) * blinkAmt;
        const rx = eye.r, ry = eye.r * (0.42 + 0.26 * open);
        ectx.save();
        ectx.globalAlpha = vis * 0.55;
        ectx.beginPath();
        ectx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2);
        ectx.fillStyle = "rgba(250,245,230,0.55)";
        ectx.strokeStyle = "rgba(60,40,10,0.85)";
        ectx.lineWidth = 1.4;
        ectx.fill();
        ectx.stroke();
        const ang = Math.atan2(mouse.y - ey, mouse.x - ex);
        const reach = Math.min(rx * 0.4, Math.hypot(mouse.x - ex, mouse.y - ey) * 0.12);
        const px = ex + Math.cos(ang) * reach, py = ey + Math.sin(ang) * reach * 0.5;
        ectx.beginPath();
        ectx.arc(px, py, eye.r * 0.34, 0, Math.PI * 2);
        ectx.fillStyle = "rgba(181,78,0,0.92)";
        ectx.fill();
        ectx.beginPath();
        ectx.arc(px, py, eye.r * 0.16, 0, Math.PI * 2);
        ectx.fillStyle = "rgba(10,9,8,0.95)";
        ectx.fill();
        ectx.restore();
      });
    }
    requestAnimationFrame(drawEyes);
  };
  requestAnimationFrame(drawEyes);

  // ─────────────────────────────────────────
  // REALITY METER — oscillates, never quite 100%
  // ─────────────────────────────────────────
  const realityMeter = $("#realityMeter");
  const realityValue = $("#realityValue");
  const realityFill  = $("#realityFill");
  if (realityMeter) {
    setTimeout(() => realityMeter.classList.add("is-visible"), 800);
    let realityBase = 100, realityNoise = 0, realityT = 0;
    const updateReality = () => {
      realityT += 0.012;
      // base level drops with scroll depth; adds chaotic noise
      const depthDrop = curDepth * 72;
      realityNoise = Math.sin(realityT * 1.7) * 4 + Math.sin(realityT * 3.1) * 2.5 + Math.sin(realityT * 0.4) * 6;
      const raw = clamp(100 - depthDrop + realityNoise, 0, 99.9);
      const pct = raw.toFixed(1);
      realityValue.textContent = pct + "%";
      realityFill.style.width = raw + "%";
      realityValue.classList.toggle("is-low", raw < 28);
      realityValue.classList.toggle("is-mid", raw >= 28 && raw < 55);
      requestAnimationFrame(updateReality);
    };
    requestAnimationFrame(updateReality);
  }

  // ─────────────────────────────────────────
  // CURSOR PARTICLE TRAIL
  // ─────────────────────────────────────────
  const TRAIL_COUNT = 18;
  const trailDots = Array.from({ length: TRAIL_COUNT }, (_, i) => {
    const d = document.createElement("div");
    d.className = "cursor-trail-dot";
    const size = lerp(7, 2, i / TRAIL_COUNT);
    d.style.cssText = `width:${size}px;height:${size}px;`;
    document.body.appendChild(d);
    return { el: d, x: mouse.x, y: mouse.y, size };
  });
  const trailHistory = Array.from({ length: TRAIL_COUNT + 1 }, () => ({ x: mouse.x, y: mouse.y }));
  let trailFrame = 0;
  const renderTrail = () => {
    trailHistory.unshift({ x: mouse.x, y: mouse.y });
    trailHistory.length = TRAIL_COUNT + 1;
    trailDots.forEach((dot, i) => {
      const pos = trailHistory[i + 1] || trailHistory[0];
      dot.el.style.transform = `translate(${pos.x}px,${pos.y}px) translate(-50%,-50%)`;
      const depthIntensity = 0.15 + curDepth * 0.85;
      const alpha = (1 - i / TRAIL_COUNT) * depthIntensity * 0.85;
      const hue = i % 2 === 0 ? "255,182,39" : "217,48,37";
      dot.el.style.background = `rgba(${hue},${alpha.toFixed(3)})`;
      dot.el.style.boxShadow = alpha > 0.3 ? `0 0 ${dot.size * 3}px rgba(255,182,39,${(alpha * 0.5).toFixed(2)})` : "";
    });
    requestAnimationFrame(renderTrail);
  };
  renderTrail();

  // ─────────────────────────────────────────
  // CLICK DREAM PORTALS
  // ─────────────────────────────────────────
  const spawnPortal = (x, y) => {
    ["click-portal--ring", "click-portal--ring2"].forEach((cls, i) => {
      const el = document.createElement("div");
      el.className = `click-portal ${cls}`;
      el.style.left = x + "px";
      el.style.top  = y + "px";
      document.body.appendChild(el);
      const dur = i === 0 ? 900 : 1300;
      setTimeout(() => el.remove(), dur + 50);
    });
  };
  window.addEventListener("click", (e) => spawnPortal(e.clientX, e.clientY));

  // ─────────────────────────────────────────
  // GLITCH HOVER — hero title + big section headings
  // ─────────────────────────────────────────
  const glitchEl = (el) => {
    if (el.classList.contains("glitching")) return;
    const txt = el.textContent;
    el.dataset.glitch = txt;
    el.classList.add("can-glitch", "glitching");
    setTimeout(() => el.classList.remove("glitching"), 320);
  };
  // Hero title letters spark + glitch on hover
  $$(".hero__title span").forEach((s, i) => {
    s.addEventListener("mouseenter", () => {
      const rotations = ["-6deg","6deg","-10deg","8deg","-4deg","10deg","-8deg","5deg","-7deg"];
      const settles   = ["-4px","4px","-6px","5px","-3px","7px","-5px","3px","-4px"];
      s.style.setProperty("--spark-rot", rotations[i % rotations.length]);
      s.style.setProperty("--spark-settle", settles[i % settles.length]);
      s.classList.add("sparking");
      const A = window.__incAudio;
      if (A) A.playTick(400 + i * 80, 0.04);
      setTimeout(() => s.classList.remove("sparking"), 500);
      // glitch the whole title element
      glitchEl(s.closest(".hero__title"));
    });
  });

  // Big section headings glitch on hover
  $$(".layers__heading, .totem__heading, .team__heading, .kick__word, .architect__heading").forEach((h) => {
    h.addEventListener("mouseenter", () => glitchEl(h));
  });

  // ─────────────────────────────────────────
  // DREAM WORD SPAWNER — depth-aware cursor words
  // ─────────────────────────────────────────
  const DREAM_WORDS = [
    "DREAM","DEEPER","INCEPT","LIMBO","KICK","WAKE","REALITY","TOTEM",
    "MEMORY","SUBCONSCIOUS","FOLD","PARADOX","ARCHITECT","FORGERY",
    "IDEA","SEED","PLANT","FALL","TIME","LAYER","DEEPER","DEEPER",
  ];
  let lastSpawnTime = 0;
  const spawnDreamWord = (x, y) => {
    if (curDepth < 0.25) return;
    const now = performance.now();
    const minInterval = lerp(800, 180, clamp((curDepth - 0.25) / 0.75, 0, 1));
    if (now - lastSpawnTime < minInterval) return;
    lastSpawnTime = now;
    const word = DREAM_WORDS[Math.floor(Math.random() * DREAM_WORDS.length)];
    const el = document.createElement("div");
    el.className = "dream-spawn-word";
    const jitter = (Math.random() - 0.5) * 120;
    el.style.left = (x + jitter) + "px";
    el.style.top  = (y - 10) + "px";
    const alpha = 0.4 + curDepth * 0.6;
    const isDeep = curDepth > 0.6;
    el.style.color = isDeep ? `rgba(217,48,37,${alpha.toFixed(2)})` : `rgba(181,78,0,${alpha.toFixed(2)})`;
    el.textContent = word;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2900);
  };
  window.addEventListener("mousemove", (e) => spawnDreamWord(e.clientX, e.clientY));

  // ─────────────────────────────────────────
  // SECTION SHOCKWAVE — on each layer enter
  // ─────────────────────────────────────────
  const fireShockwave = () => {
    const el = document.createElement("div");
    el.className = "section-shockwave";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  };
  $$(".layer").forEach((layer) => {
    ScrollTrigger.create({
      trigger: layer,
      start: "top 55%",
      onEnter: fireShockwave,
    });
  });

  // ─────────────────────────────────────────
  // WAVEFORM VISUALIZER on KICK
  // ─────────────────────────────────────────
  const waveCanvas = $("#kickWaveform");
  if (waveCanvas) {
    const wctx = waveCanvas.getContext("2d");
    let waveT = 0;
    let waveActive = false;
    const resizeWave = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      waveCanvas.width  = waveCanvas.offsetWidth  * dpr;
      waveCanvas.height = waveCanvas.offsetHeight * dpr;
      wctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeWave();
    window.addEventListener("resize", resizeWave);
    ScrollTrigger.create({
      trigger: ".kick", start: "top 80%",
      onEnter: () => { waveActive = true; },
    });
    const drawWave = () => {
      const W = waveCanvas.offsetWidth, H = waveCanvas.offsetHeight;
      wctx.clearRect(0, 0, W, H);
      if (!waveActive) { requestAnimationFrame(drawWave); return; }
      waveT += 0.022;
      // draw 4 overlapping waves at different phases/amps
      const WAVES = [
        { amp: 0.22, freq: 0.009, phase: 0,         color: "rgba(255,182,39,0.55)",  lw: 2 },
        { amp: 0.14, freq: 0.014, phase: 2.1,        color: "rgba(255,106,0,0.35)",   lw: 1.5 },
        { amp: 0.08, freq: 0.022, phase: 4.4,        color: "rgba(217,48,37,0.28)",   lw: 1 },
        { amp: 0.32, freq: 0.005, phase: waveT * 0.4, color: "rgba(255,255,255,0.08)", lw: 3 },
      ];
      WAVES.forEach(({ amp, freq, phase, color, lw }) => {
        wctx.beginPath();
        wctx.strokeStyle = color;
        wctx.lineWidth = lw;
        for (let x = 0; x <= W; x += 2) {
          const y = H / 2 + Math.sin(x * freq + waveT + phase) * H * amp
                           + Math.sin(x * freq * 2.3 + waveT * 1.4 + phase) * H * amp * 0.4;
          x === 0 ? wctx.moveTo(x, y) : wctx.lineTo(x, y);
        }
        wctx.stroke();
      });
      // central BWAAM pulse ring
      const pulse = (Math.sin(waveT * 2.8) + 1) / 2;
      const r = 60 + pulse * 80;
      const grad = wctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, r);
      grad.addColorStop(0, `rgba(255,182,39,${(pulse * 0.3).toFixed(2)})`);
      grad.addColorStop(1, "rgba(255,182,39,0)");
      wctx.beginPath();
      wctx.arc(W/2, H/2, r, 0, Math.PI * 2);
      wctx.fillStyle = grad;
      wctx.fill();
      requestAnimationFrame(drawWave);
    };
    requestAnimationFrame(drawWave);
  }

  // ─────────────────────────────────────────
  // SCROLL VELOCITY BLUR
  // ─────────────────────────────────────────
  let lastScrollY = window.scrollY, scrollVelocity = 0;
  let fastScrollTimer = null;
  lenis.on("scroll", ({ velocity }) => {
    scrollVelocity = Math.abs(velocity);
    const fast = scrollVelocity > 4.5;
    document.body.classList.toggle("fast-scroll", fast);
    clearTimeout(fastScrollTimer);
    fastScrollTimer = setTimeout(() => document.body.classList.remove("fast-scroll"), 200);
    // tilt the scroll content slightly with velocity
    const tiltPx = clamp(velocity * 1.8, -12, 12);
    document.documentElement.style.setProperty("--scroll-tilt", tiltPx + "px");
  });

  // ─────────────────────────────────────────
  // MAGNETIC FIELD RINGS around giant totem
  // ─────────────────────────────────────────
  if (totemStage) {
    [280, 380, 500, 640].forEach((sz, i) => {
      const ring = document.createElement("div");
      ring.className = "totem-field-ring";
      ring.style.cssText = `
        width:${sz}px; height:${sz}px;
        animation-delay:${i * 0.75}s;
        animation-duration:${3 + i * 0.8}s;
      `;
      totemStage.appendChild(ring);
    });
  }

  // ─────────────────────────────────────────
  // KICK WORD — heartbeat pulse when visible
  // ─────────────────────────────────────────
  if (kickWord) {
    let kickPulseTimer = null;
    const beatKick = () => {
      kickWord.classList.add("beat");
      setTimeout(() => kickWord.classList.remove("beat"), 260);
      kickPulseTimer = setTimeout(beatKick, 900);
    };
    ScrollTrigger.create({
      trigger: ".kick", start: "top 60%", end: "bottom top",
      onToggle: (self) => {
        clearTimeout(kickPulseTimer);
        if (self.isActive) beatKick();
      },
    });
  }

  // ─────────────────────────────────────────
  // OUTRO TOTEM ECHO — ghost ring on scroll into view
  // ─────────────────────────────────────────
  ScrollTrigger.create({
    trigger: ".outro", start: "top 70%",
    onEnter: () => {
      const wrap = $(".outro__top-wrap");
      if (!wrap) return;
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const echo = document.createElement("div");
          echo.className = "outro-echo";
          echo.innerHTML = wrap.querySelector(".totem3d") ? wrap.querySelector(".totem3d").outerHTML : "";
          echo.style.animationDelay = `${i * 0.4}s`;
          wrap.appendChild(echo);
          setTimeout(() => echo.remove(), 3200);
        }, i * 400);
      }
    },
  });

  // ─────────────────────────────────────────
  // PARALLAX TILT ON MOUSE — each section gets subtle depth
  // ─────────────────────────────────────────
  // Only target containers that GSAP doesn't animate directly
  const parallaxSections = $$(".idea__content, .totem__content");
  window.addEventListener("mousemove", (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;
    parallaxSections.forEach((el) => {
      const r = el.getBoundingClientRect();
      const inView = r.top < window.innerHeight && r.bottom > 0;
      if (!inView) return;
      el.style.transform = `perspective(1200px) rotateX(${cy * -1.5}deg) rotateY(${cx * 2}deg) translateZ(0)`;
    });
  });
  window.addEventListener("mouseleave", () => {
    parallaxSections.forEach((el) => { el.style.transform = ""; });
  });

  // ─────────────────────────────────────────
  // KEEP SCROLLTRIGGER IN SYNC
  // ─────────────────────────────────────────
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();

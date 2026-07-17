/* ============================================================
   Hitik Panchal — Portfolio interactions
   ============================================================ */

// ---------- Typewriter ----------
const roles = [
  "AI & NLP systems.",
  "high-throughput backends.",
  "LLM fine-tuning pipelines.",
  "full-stack web apps.",
  "tools for hassles that shouldn't exist.",
  "football simulators. ⚽",
];
const tw = document.getElementById("typewriter");
let roleIdx = 0, charIdx = 0, deleting = false;

function typeLoop() {
  const word = roles[roleIdx];
  tw.textContent = word.slice(0, charIdx);
  let delay = deleting ? 38 : 72;

  if (!deleting && charIdx === word.length) {
    delay = 1800; // pause on full word
    deleting = true;
  } else if (deleting && charIdx === 0) {
    deleting = false;
    roleIdx = (roleIdx + 1) % roles.length;
    delay = 350;
  } else {
    charIdx += deleting ? -1 : 1;
  }
  setTimeout(typeLoop, delay);
}
typeLoop();

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- Superhero portrait flight (hero → about) ----------
// The hero portrait detaches on scroll, flies down with a glow trail,
// and docks into the About section's photo slot.
(function initFlight() {
  const heroAnchor = document.getElementById("heroPhotoAnchor");
  const aboutSlot = document.getElementById("photoSlot");
  const img = document.getElementById("portraitImg");
  if (!heroAnchor || !aboutSlot || !img) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mq = window.matchMedia("(max-width: 860px)");

  img.addEventListener("error", () => {
    heroAnchor.style.display = "none";
  });

  // Reduced motion: no flight — caricature stays in the hero, real photo sits in About.
  if (reducedMotion) return;

  // Build the flying wrapper.
  const fly = document.createElement("div");
  fly.className = "fly-photo";
  const trail = document.createElement("div");
  trail.className = "fly-photo__trail";
  fly.appendChild(trail);
  document.body.appendChild(fly);

  // Narrow screens: no caricature (hero portrait is hidden), About photo is static.
  // Wide screens: the caricature flies. Switches live on resize.
  function setMode() {
    if (mq.matches) {
      fly.style.display = "none";
      if (img.parentElement !== heroAnchor) {
        img.style.cssText = "";
        heroAnchor.appendChild(img);
      }
    } else {
      if (img.parentElement !== fly) {
        img.style.cssText = "";
        fly.appendChild(img);
      }
      fly.style.display = "";
      updateFlight();
    }
  }
  mq.addEventListener("change", setMode);

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  let ticking = false;
  function updateFlight() {
    ticking = false;
    if (mq.matches) return;
    const a = heroAnchor.getBoundingClientRect();
    const b = aboutSlot.getBoundingClientRect();

    // progress: 0 at page top, 1 once the About slot is ~1/3 down the viewport
    const docTopB = b.top + window.scrollY;
    const end = Math.max(docTopB - window.innerHeight * 0.32, 1);
    const p = clamp(window.scrollY / end, 0, 1);
    const e = easeInOut(p);

    const eV = p * p; // gravity — the fall starts slow and accelerates
    fly.style.left = lerp(a.left, b.left, e) + "px";
    fly.style.top = lerp(a.top, b.top, Math.max(eV, e - 0.12)) + "px";
    fly.style.width = lerp(a.width, b.width, e) + "px";
    fly.style.height = lerp(a.height, b.height, e) + "px";

    // falling: slight tumble + vertical stretch mid-air, squash on landing
    const arc = Math.sin(p * Math.PI);
    const squash = Math.sin(clamp((p - 0.8) / 0.2, 0, 1) * Math.PI);
    const sx = 1 - 0.04 * arc + 0.09 * squash;
    const sy = 1 + 0.07 * arc - 0.12 * squash;
    fly.style.transform = `rotate(${arc * -7}deg) scale(${sx}, ${sy})`;
    trail.style.opacity = arc.toFixed(3);

    // the merge: caricature dissolves into the real photo as it lands
    img.style.opacity = String(1 - clamp((p - 0.55) / 0.4, 0, 1));
    img.style.borderRadius = lerp(24, 16, e) + "px";
  }

  function requestFlight() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateFlight);
    }
  }

  window.addEventListener("scroll", requestFlight, { passive: true });
  window.addEventListener("resize", requestFlight);
  if (img.complete) setMode();
  else img.addEventListener("load", setMode);
})();

// ---------- Nav: shrink on scroll, hide on scroll down ----------
const nav = document.getElementById("nav");
let lastY = window.scrollY;
window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    nav.classList.toggle("nav--scrolled", y > 40);
    // hide when scrolling down past hero, show when scrolling up
    if (y > 500 && y > lastY + 6) nav.classList.add("nav--hidden");
    else if (y < lastY - 6) nav.classList.remove("nav--hidden");
    lastY = y;
  },
  { passive: true }
);

// ---------- Active nav link highlighting ----------
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav__links a");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        navLinks.forEach((a) =>
          a.classList.toggle("active", a.dataset.section === e.target.id)
        );
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((s) => sectionObserver.observe(s));

// ---------- Cursor glow ----------
const glow = document.querySelector(".cursor-glow");
const finePointer = window.matchMedia("(pointer: fine)").matches;
if (finePointer) {
  window.addEventListener(
    "mousemove",
    (e) => {
      glow.style.opacity = "1";
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    },
    { passive: true }
  );
}

// ---------- Magnetic buttons ----------
if (finePointer) {
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

// ---------- Card tilt ----------
if (finePointer) {
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// ---------- Live preview iframes (click-to-load, screenshot fallback) ----------
document.querySelectorAll(".browser-frame__body").forEach((body) => {
  const btn = body.querySelector(".browser-frame__load");
  const src = body.dataset.src;
  const fallback = body.dataset.fallback;

  // If a snapshot image exists in assets, show it behind the load button
  if (fallback) {
    const img = new Image();
    img.src = fallback;
    img.alt = "";
    img.className = "snapshot";
    img.onload = () => body.prepend(img);
  }

  if (btn) {
    btn.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.loading = "lazy";
      iframe.title = "Live project preview";
      body.appendChild(iframe);
      btn.remove();
      const snap = body.querySelector(".snapshot");
      if (snap) snap.remove();
    });
  }
});

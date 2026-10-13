// Mobile nav toggle
(function () {
  const btn = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!btn || !links) return;
  btn.addEventListener("click", function () {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();

// Dropdown nav groups (click to toggle; closes others; closes on outside click/Escape)
(function () {
  const groups = document.querySelectorAll(".navgroup");
  if (!groups.length) return;

  function closeAll(except) {
    groups.forEach(function (g) {
      if (g !== except) {
        g.classList.remove("open");
        const b = g.querySelector("button.top");
        if (b) b.setAttribute("aria-expanded", "false");
      }
    });
  }

  groups.forEach(function (group) {
    const btn = group.querySelector("button.top");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = group.classList.contains("open");
      closeAll(group);
      group.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  document.addEventListener("click", function () { closeAll(null); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll(null);
  });
})();

// Publication search + theme/year filters
(function () {
  const input = document.getElementById("pubSearch");
  const groups = document.querySelectorAll(".pub-year-group");
  const empty = document.getElementById("pubEmpty");
  if (!input) return;
  let theme = "all", year = "all";

  function apply() {
    const q = input.value.trim().toLowerCase();
    let anyVisible = false;
    groups.forEach(function (group) {
      const gy = (group.getAttribute("data-year") || "").toLowerCase();
      let groupHasVisible = false;
      group.querySelectorAll(".pub-item").forEach(function (item) {
        const text = item.getAttribute("data-text") || "";
        const themes = (item.getAttribute("data-themes") || "").split(" ");
        const ok = (q === "" || text.includes(q)) &&
                   (theme === "all" || themes.includes(theme)) &&
                   (year === "all" || gy === year);
        item.hidden = !ok;
        if (ok) groupHasVisible = true;
      });
      group.style.display = groupHasVisible ? "" : "none";
      if (groupHasVisible) anyVisible = true;
    });
    empty.style.display = anyVisible ? "none" : "block";
  }
  input.addEventListener("input", apply);

  function wire(rowId, attr, setter) {
    const row = document.getElementById(rowId);
    if (!row) return;
    row.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        row.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        setter(chip.getAttribute(attr));
        apply();
      });
    });
  }
  wire("themeChips", "data-theme", function (v) { theme = v; });
  wire("yearChips", "data-year", function (v) { year = v.toLowerCase(); });
})();

// Placeholder external links — replaced once real URLs are provided
(function () {
  const placeholders = {
    "link-scholar": null,
    "link-linkedin": null,
    "link-scholar-2": null,
    "link-linkedin-2": null
  };
  Object.keys(placeholders).forEach(function (id) {
    const el = document.getElementById(id);
    if (el && !placeholders[id]) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
      });
    }
  });
})();

// Theme toggle (light / dark)
(function () {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.addEventListener("click", function () {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();

// Animated counters (hero stat strip)
(function () {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function run(el) {
    const end = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = end + suffix; return; }
    const dur = 1400, t0 = performance.now();
    function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!("IntersectionObserver" in window)) return;
  nums.forEach(function (el) { el.textContent = "0"; });
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  nums.forEach(function (el) { io.observe(el); });
})();

// Scroll reveal
(function () {
  if (!("IntersectionObserver" in window)) return;
  const targets = document.querySelectorAll("main .section-inner, .pagehead, .latest-card, .visit-card, .research-fig, .pub-item");
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  targets.forEach(function (el) {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already in view: leave visible
    el.classList.add("reveal"); io.observe(el);
  });
})();

// World map: tooltip + chip/pin linking
(function () {
  document.querySelectorAll(".worldmap").forEach(function (wm) {
    const stage = wm.querySelector(".map-stage");
    const tip = wm.querySelector(".map-tip");
    const pins = wm.querySelectorAll(".mpin[data-id]");
    const chips = wm.querySelectorAll(".visit-chip");
    function show(pin) {
      const sr = stage.getBoundingClientRect(), pr = pin.getBoundingClientRect();
      tip.innerHTML = "<b>" + pin.getAttribute("data-label") + "</b>" + pin.getAttribute("data-sub");
      tip.style.left = (pr.left + pr.width / 2 - sr.left) + "px";
      tip.style.top = (pr.top + pr.height / 2 - sr.top) + "px";
      tip.hidden = false;
    }
    function hide() { tip.hidden = true; }
    function mark(id, on) {
      pins.forEach(function (p) { if (p.getAttribute("data-id") === id) p.classList.toggle("on", on); });
      chips.forEach(function (c) { if (c.getAttribute("data-id") === id) c.classList.toggle("on", on); });
    }
    pins.forEach(function (p) {
      p.addEventListener("mouseenter", function () { show(p); mark(p.getAttribute("data-id"), true); });
      p.addEventListener("focus", function () { show(p); mark(p.getAttribute("data-id"), true); });
      p.addEventListener("mouseleave", function () { hide(); mark(p.getAttribute("data-id"), false); });
      p.addEventListener("blur", function () { hide(); mark(p.getAttribute("data-id"), false); });
      p.addEventListener("click", function (e) {
        e.stopPropagation(); show(p);
        const card = document.getElementById("visit-" + p.getAttribute("data-id"));
        if (card) { card.scrollIntoView({ behavior: "smooth", block: "center" }); card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash"); }
      });
    });
    chips.forEach(function (c) {
      const id = c.getAttribute("data-id");
      c.addEventListener("mouseenter", function () { mark(id, true); });
      c.addEventListener("mouseleave", function () { mark(id, false); });
      c.addEventListener("click", function () {
        const card = document.getElementById("visit-" + id);
        if (card) { card.scrollIntoView({ behavior: "smooth", block: "center" }); card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash"); }
        else { const pin = stage.querySelector('.mpin.visit[data-id="' + id + '"]'); if (pin) show(pin); }
      });
    });
    document.addEventListener("click", hide);
  });
})();

// Flood-process explorer
(function () {
  const app = document.getElementById("explorer-app");
  if (!app) return;
  const img = document.getElementById("exImg");
  const note = document.getElementById("exNote");
  const fills = app.querySelectorAll(".ex-fill");
  const vals = app.querySelectorAll(".ex-val");
  const data = {
    all: [74, 23, 3],
    dry: [70, 27, 3]
  };
  const notes = {
    "a-all": "By event count: 153 of 206 catchments are excess-rain dominated, 47 long-rain and 6 short-rain.",
    "a-dry": "Dry catchments show a more balanced mix, with long-rain floods accounting for roughly a quarter of them.",
    "b-all": "Classified by extreme-event rate, excess-rain floods still dominate across the region. Bars show the event-count shares.",
    "b-dry": "Dry catchments remain more mixed under the extreme-event criterion. Bars show the event-count shares.",
    "c-all": "Classified by share of flood volume, excess-rain floods again dominate. Bars show the event-count shares.",
    "c-dry": "Long-rain floods carry a larger share in dry catchments. Bars show the event-count shares."
  };
  let map = "a", grp = "all";
  function render(animate) {
    fills.forEach(function (f, i) { f.style.width = data[grp][i] + "%"; });
    vals.forEach(function (v, i) { v.textContent = data[grp][i] + "%"; });
    note.textContent = notes[map + "-" + grp];
  }
  app.querySelectorAll(".ex-tab").forEach(function (t) {
    t.addEventListener("click", function () {
      app.querySelectorAll(".ex-tab").forEach(function (x) { x.classList.remove("active"); x.setAttribute("aria-selected", "false"); });
      t.classList.add("active"); t.setAttribute("aria-selected", "true");
      map = t.getAttribute("data-map");
      img.classList.add("fade");
      setTimeout(function () { img.src = "assets/img/research/explorer-" + map + ".jpg"; img.classList.remove("fade"); }, 180);
      render();
    });
  });
  app.querySelectorAll(".ex-grp").forEach(function (g) {
    g.addEventListener("click", function () {
      app.querySelectorAll(".ex-grp").forEach(function (x) { x.classList.remove("active"); });
      g.classList.add("active"); grp = g.getAttribute("data-grp"); render();
    });
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { render(); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(app);
  } else { render(); }
})();

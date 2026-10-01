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

// Publication search filter
(function () {
  const input = document.getElementById("pubSearch");
  const groups = document.querySelectorAll(".pub-year-group");
  const empty = document.getElementById("pubEmpty");
  if (!input) return;

  input.addEventListener("input", function () {
    const q = input.value.trim().toLowerCase();
    let anyVisible = false;

    groups.forEach(function (group) {
      let groupHasVisible = false;
      group.querySelectorAll(".pub-item").forEach(function (item) {
        const text = item.getAttribute("data-text") || "";
        const match = q === "" || text.includes(q);
        item.hidden = !match;
        if (match) groupHasVisible = true;
      });
      group.style.display = groupHasVisible ? "" : "none";
      if (groupHasVisible) anyVisible = true;
    });

    empty.style.display = anyVisible ? "none" : "block";
  });
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

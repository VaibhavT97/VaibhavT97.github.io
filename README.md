# vaibhav-tripathi.github.io

Personal academic website for Vaibhav Tripathi — PhD researcher, Department of Water Resources Development and Management, IIT Roorkee.

Static site, no build step. Plain HTML/CSS/JS, deployed via GitHub Pages.

## Structure

```
index.html              — the whole site (single page)
assets/css/style.css     — styles
assets/js/main.js        — publication search filter
assets/img/profile.jpg   — headshot
assets/files/Vaibhav_Tripathi_CV.pdf — downloadable CV
```

## Editing content

Everything is in `index.html` — sections are marked with `<section id="...">`. To update:
- **Publications** — add a new `.pub-item` block inside the right `.pub-year-group` (or create a new year group).
- **CV** — replace `assets/files/Vaibhav_Tripathi_CV.pdf` with the new file (keep the same filename, or update the link in `index.html` and the "Download CV" / "Download full CV" links).
- **Photo** — replace `assets/img/profile.jpg`.

## Still to do

- Add real Google Scholar and LinkedIn URLs — placeholders are in `index.html` (search for `link-scholar` and `link-linkedin`) and disabled in `assets/js/main.js` until filled in.

## Local preview

```
python3 -m http.server 8000
```
then open `http://localhost:8000`.

## Deploying

Push to a repo named `<username>.github.io` and enable GitHub Pages (Settings → Pages → Deploy from branch → `main` / root). The site will be live at `https://<username>.github.io`.

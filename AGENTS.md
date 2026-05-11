## Cursor Cloud specific instructions

This is a zero-dependency static website (personal portfolio for David Thibault). There are no build steps, package managers, test frameworks, or linting tools.

### Files

- `index.html` — Single-page site with inline CSS, no JavaScript
- `CNAME` — GitHub Pages custom domain (`www.leddt.com`)
- `face.png` — Favicon

### Running locally

Serve with any static file server, e.g.:

```
python3 -m http.server 8080 --directory /workspace
```

Then open `http://localhost:8080/` in a browser. The page loads external `normalize.css` from cdnjs (cosmetic only; works without it).

### Testing

No automated tests exist. Manual browser testing is the only verification method — confirm the page renders correctly and hover effects on links work (scale + color change).

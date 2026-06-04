# jessewunderlich.com

My personal corner of the web — hand-coded, early-web / GeoCities aesthetic. No frameworks, no build step, no trackers. Just one little guestbook script (giscus).

**Live:** <https://www.jesse-wunderlich.com/>

## Stack
- Plain HTML + CSS, hand-authored
- Guestbook: [giscus](https://giscus.app) (backed by GitHub Discussions)
- Hosting: Vercel (auto-deploys on push to `main`)

## Local preview
```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure
- `index.html` — the whole site (single page for now)
- `favicon.svg` — pixel-art "JW" mark
- `og-image.png` — social share card (1200×630)
- `robots.txt` / `sitemap.xml` — crawl basics

## License
Code is MIT (see `LICENSE`). Content & personal text © Jesse Wunderlich.

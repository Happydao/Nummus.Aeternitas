# NUMMUS Aeternitas

Official institutional homepage for NUMMUS. The site is dependency-free, reads verified treasury data from the public NUMMUS dashboard dataset, and retains a compact local snapshot for resilient fallback rendering.

## Local verification

```sh
npm test
npm run build
python3 -m http.server 4173 --directory dist
```

Data updates are received through `.github/workflows/update-nummus-data.yml`; GitHub Pages deployment is handled by `.github/workflows/deploy-pages.yml`.

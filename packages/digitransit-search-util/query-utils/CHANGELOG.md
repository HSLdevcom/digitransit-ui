# @digitransit-search-util/digitransit-search-util-query-utils

## 5.0.0

### Major Changes

- 101637e: Breaking: `import` now resolves to the ESM build (`lib/index.js`), which only bundlers can load. Node's own ESM loader can't, so use `require()` there, which still gets the UMD build (`lib/index.cjs`).

/* eslint-disable no-undef, no-restricted-syntax */
__wpo.assets.main = __wpo.assets.main.map(
  asset => (__wpo.externals.includes(asset) ? asset : `ASSET_URL${asset}`),
);
__wpo.assets.additional = __wpo.assets.additional.map(
  asset => (__wpo.externals.includes(asset) ? asset : `ASSET_URL${asset}`),
);
__wpo.assets.optional = __wpo.assets.optional.map(
  asset => (__wpo.externals.includes(asset) ? asset : `ASSET_URL${asset}`),
);
for (const key in __wpo.hashesMap) {
  if (!__wpo.externals.includes(__wpo.hashesMap[key])) {
    __wpo.hashesMap[key] = `ASSET_URL${__wpo.hashesMap[key]}`;
  }
}


export default (features, config) => {
  if (!config.search.mapPeliasModality) {
    return features;
  }

  const mapping = config.search.peliasMapping;
  return features.map((feature) => {
    const mappedFeature = Object.assign({}, feature);
    const categories = feature.properties.category;
    if (categories) {
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        if (category in mapping) {
          mappedFeature.properties.mode = mapping[category];

          if (config.search.peliasLayer) {
            mappedFeature.properties.layer = config.search.peliasLayer(category);
          }
          break;
        }
      }
    }
    return mappedFeature;
  });
};

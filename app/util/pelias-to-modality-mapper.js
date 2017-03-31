/* eslint-disable no-unused-vars */

// Example configuration for config.*.js to enable pelias search and mapping functionality
const exampleConfig = {
// ...
  search: {
    usePeliasStops: true, // enable to use pelias to search for stops
    mapPeliasModality: true, // enable to map pelias stops to otp
    peliasMapping: { // mapping values
      onstreetBus: 'BUS',
      onstreetTram: 'TRAM',
      airport: 'AIRPORT',
      railStation: 'RAIL',
      metroStation: 'SUBWAY',
      busStation: 'BUS',
      tramStation: 'TRAM',
      harbourPort: 'FERRY',
      ferryPort: 'FERRY',
      ferryStop: 'FERRY',
      liftStation: 'FUNICULAR',
    },
    peliasLayer: () => 'stop', // function to change layer
    peliasLocalization: (feature) => {
      // localization example; showing locality (county) in label and name
      const localized = { ...feature };
      localized.properties.label = `${feature.properties.name}, ${feature.properties.locality}`;
      localized.properties.name = `${feature.properties.name}, ${feature.properties.locality}`;
      return localized;
    },
  },
// ...
};

export default (features, config) => {
  if (!config.search.mapPeliasModality) {
    return features;
  }

  const mapping = config.search.peliasMapping;
  return features.map((feature) => {
    const mappedFeature = { ...feature };
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
    if (config.search.peliasLocalization) {
      return config.search.peliasLocalization(mappedFeature);
    }
    return mappedFeature;
  });
};

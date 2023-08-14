/* eslint-disable no-param-reassign */
export const configureCountry = (config, countries) => {
  if (config.mainMenu.countrySelection?.length) {
    const selectedCountries = countries;
    const keys = Object.keys(selectedCountries);
    let boundaries = config.additionalSearchParams.default['boundary.country'];
    let feedIds = [...config.feedIds];
    keys.forEach(key => {
      const additionalFeedIds = config.additionalFeedIds[key];
      if (selectedCountries[key]) {
        // Country selected
        if (config.additionalSearchParams[key]['boundary.country']) {
          boundaries += ',';
        }
        boundaries += config.additionalSearchParams[key]['boundary.country'];
        if (additionalFeedIds.every(id => feedIds.indexOf(id) < 0)) {
          feedIds = [...feedIds, ...additionalFeedIds];
        }
      } else {
        // Country not selected
        feedIds = [...feedIds].filter(id => additionalFeedIds.indexOf(id) < 0);
      }
    });
    if (!config.searchParams) {
      config.searchParams = {};
    }
    config.searchParams = {
      ...config.searchParams,
      'boundary.country': boundaries,
    };
    config.feedIds = feedIds;
  }
};

export default configureCountry;

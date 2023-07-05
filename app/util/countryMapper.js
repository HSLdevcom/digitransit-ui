/* Mapper used to map geocoding country to country code */
export const getGeocodingCountryCode = country => {
  const countryCodeMap = {
    estonia: 'EST',
  };
  if (!countryCodeMap[country]) {
    return '';
  }
  return countryCodeMap[country];
};

/* Mapper used to map country to feedId */
export const getCountryFeedId = country => {
  const feedIdMap = {
    estonia: ['Vikingline', 'Viro'],
  };
  if (!feedIdMap[country]) {
    return '';
  }
  return feedIdMap[country];
};

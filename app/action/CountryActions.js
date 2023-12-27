export const updateCountries = (actionContext, countries) => {
  actionContext.dispatch('UpdateCountries', countries);
};

export default updateCountries;

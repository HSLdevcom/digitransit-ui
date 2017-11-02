// Convert between location objects (address, lat, lon)
// and string format OpenTripPlanner uses in many places

export const otpToLocation = otpString => {
  const [address, coords] = otpString.split('::');
  if (coords) {
    return {
      address,
      lat: parseFloat(coords.split(',')[0]),
      lon: parseFloat(coords.split(',')[1]),
    };
  }
  return { address };
};

export const addressToItinerarySearch = location => {
  if (location.set === false) {
    return '-';
  }
  return `${location.address}::${location.lat},${location.lon}`;
};

export const locationToOTP = location => {
  if (location.gps) {
    return 'POS';
  }
  if (location.set === false) {
    return '-';
  }
  return `${location.address}::${location.lat},${location.lon}`;
};

export const locationToCoords = location => [location.lat, location.lon];

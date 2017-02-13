// Convert between location objects (address, lat, lon)
// and string format OpenTripPlanner uses in many places


export const otpToLocation = (otpString) => {
  const [address, coords] = otpString.split('::');
  if (coords) {
    return ({
      address,
      lat: parseFloat(coords.split(',')[0]),
      lon: parseFloat(coords.split(',')[1]),
    });
  }
  return { address };
};

export const locationToOTP = location => `${location.address}::${location.lat},${location.lon}`;

export const locationToCoords = location => [location.lat, location.lon];

// Convert between location objects (address, lat, lon)
// and string format OpenTripPlanner uses in many places


export const otpToLocation = otpString => ({
  address: otpString.split('::')[0],
  lat: parseFloat(otpString.split('::')[1].split(',')[0]),
  lon: parseFloat(otpString.split('::')[1].split(',')[1]),
});

export const locationToOTP = location => `${location.address}::${location.lat},${location.lon}`;

export const locationToCoords = location => [location.lat, location.lon];

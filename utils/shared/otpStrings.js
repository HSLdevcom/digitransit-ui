// Convert between location objects (address, lat, lon)
// and string format OpenTripPlanner uses in many places

export function parseLatLon(coords) {
  const latlon = coords.split(',');
  if (latlon.length === 2) {
    const lat = parseFloat(latlon[0]);
    const lon = parseFloat(latlon[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      return {
        lat,
        lon,
      };
    }
  }
  return undefined;
}

export function otpToLocation(otpString) {
  const [addressParts, coords, slack] = otpString.split('::');
  const [address, gtfsId] = addressParts.split('**');
  const location = { address, gtfsId };

  if (slack) {
    const parsedSlack = parseInt(slack, 10);
    if (!Number.isNaN(parsedSlack)) {
      location.locationSlack = parsedSlack;
    }
  }

  if (coords) {
    return {
      ...location,
      ...parseLatLon(coords),
    };
  }

  return location;
}

export function locationToOTP(location) {
  if (location.lat) {
    const address = location.address || '';
    const slack = location.locationSlack ? `::${location.locationSlack}` : '';
    const addressParts = location.gtfsId
      ? `${address}**${location.gtfsId}`
      : address;
    return `${addressParts}::${location.lat},${location.lon}${slack}`;
  }
  if (location.type === 'SelectFromMap') {
    return location.type;
  }
  return '-';
}

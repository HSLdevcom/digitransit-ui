// Convert between location objects (address, lat, lon)
// and string format OpenTripPlanner uses in many places

export const parseLatLon = coords => {
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
};

export const otpToLocation = otpString => {
  const [address, coords, slack] = otpString.split('::');
  const location = {
    address,
  };
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
};

export const addressToItinerarySearch = location => {
  if (location.set === false) {
    return '-';
  }
  return `${encodeURIComponent(location.address)}::${location.lat},${
    location.lon
  }`;
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

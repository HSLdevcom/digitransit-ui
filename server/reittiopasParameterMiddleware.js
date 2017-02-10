import proj4 from 'proj4';
import { locationToOTP } from '../app/util/otpStrings';
import { getGeocodingResult } from '../app/util/searchUtils';

const kkj2 = '+proj=tmerc +lat_0=0 +lon_0=24 +k=1 +x_0=2500000 +y_0=0 +ellps=intl +towgs84=-96.0617,-82.4278,-121.7535,4.80107,0.34543,-1.37646,1.4964 +units=m +no_defs';

const kkj2ToWgs84 = proj4(kkj2, 'WGS84').forward;
const placeParser = /^[^*]*\*([^*]*)\*([^*]*)\*([^*]*)/;

function parseLocation(location, input) {
  if (location) {
    const parsedFrom = placeParser.exec(location);
    if (parsedFrom) {
      const coords = kkj2ToWgs84([parsedFrom[2], parsedFrom[3]]);
      return Promise.resolve(
        locationToOTP({ address: parsedFrom[1], lon: coords[0], lat: coords[1] }),
      );
    }
  }
}

export default function reittiopasParameterMiddleware(req, res, next) {
  if (req.query.from || req.query.to || req.query.from_in || req.query.to_in) {
    Promise.all([
      parseLocation(req.query.from, req.query.from_in),
      parseLocation(req.query.to, req.query.to_in),
    ]).then(([from, to]) => res.redirect(`/reitti/${from}/${to}`));
  } else {
    next();
  }
}

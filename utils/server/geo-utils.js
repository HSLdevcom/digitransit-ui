/* eslint-disable camelcase */
import { toRad, toDeg } from '../shared/geo-utils.js';

// Simpler version of boundWithMinimumArea that uses lonlat array
// No checks for null values and assumes box is large enough
export function boundWithMinimumAreaSimple(points) {
  const lons = [];
  const lats = [];
  points.forEach(coordinatePair => {
    lons.push(coordinatePair[0]);
    lats.push(coordinatePair[1]);
  });
  const minlat = Math.min(...lats);
  const minlon = Math.min(...lons);
  const maxlat = Math.max(...lats);
  const maxlon = Math.max(...lons);
  return [
    [minlat, minlon],
    [maxlat, maxlon],
  ];
}

function calculateEllipsoidParams(ellipsoid) {
  const { a, f } = ellipsoid;
  const extEllipsoid = { ...ellipsoid };

  extEllipsoid.b = a - extEllipsoid.a * extEllipsoid.f;

  const n = f / (2.0 - f);

  extEllipsoid.n = n;
  extEllipsoid.A1 = (a / (1.0 + n)) * (1.0 + n ** 2 / 4.0 + n ** 4 / 64.0);
  extEllipsoid.e = Math.sqrt(2.0 * f - f ** 2);
  extEllipsoid.h1 =
    (1.0 / 2.0) * n -
    (2.0 / 3.0) * n ** 2 +
    (37.0 / 96.0) * n ** 3 -
    (1.0 / 360.0) * n ** 4;
  extEllipsoid.h2 =
    (1.0 / 48.0) * n ** 2 + (1.0 / 15.0) * n ** 3 - (437.0 / 1440.0) * n ** 4;
  extEllipsoid.h3 = (17.0 / 480.0) * n ** 3 - (37.0 / 840.0) * n ** 4;
  extEllipsoid.h4 = (4397.0 / 161280.0) * n ** 4;
  extEllipsoid.h1p =
    (1.0 / 2.0) * n -
    (2.0 / 3.0) * n ** 2 +
    (5.0 / 16.0) * n ** 3 +
    (41.0 / 180.0) * n ** 4;
  extEllipsoid.h2p =
    (13.0 / 48.0) * n ** 2 - (3.0 / 5.0) * n ** 3 + (557.0 / 1440.0) * n ** 4;
  extEllipsoid.h3p = (61.0 / 240.0) * n ** 3 - (103.0 / 140.0) * n ** 4;
  extEllipsoid.h4p = (49561.0 / 161280.0) * n ** 4;

  return extEllipsoid;
}

const kkjEllipsoid = calculateEllipsoidParams({
  a: 6378388.0,
  f: 1.0 / 297.0,
  k0: 1.0,
});

const wgsEllipsoid = calculateEllipsoidParams({
  a: 6378137.0,
  b: 6356752.314245,
  f: 1.0 / 298.257223563,
  k0: 0.9996,
});

export function kkj2ToWgs84(coords) {
  const lo0 = toRad(24.0);
  const E0 = 2500000.0;

  const { A1, k0, e, h1, h2, h3, h4 } = kkjEllipsoid;

  const kkjX = parseFloat(coords[0]);
  const kkjY = parseFloat(coords[1]);

  const E = kkjY / (A1 * k0);
  const nn = (kkjX - E0) / (A1 * k0);

  const E1p = h1 * Math.sin(2.0 * E) * Math.cosh(2.0 * nn);
  const E2p = h2 * Math.sin(4.0 * E) * Math.cosh(4.0 * nn);
  const E3p = h3 * Math.sin(6.0 * E) * Math.cosh(6.0 * nn);
  const E4p = h4 * Math.sin(8.0 * E) * Math.cosh(8.0 * nn);
  const nn1p = h1 * Math.cos(2.0 * E) * Math.sinh(2.0 * nn);
  const nn2p = h2 * Math.cos(4.0 * E) * Math.sinh(4.0 * nn);
  const nn3p = h3 * Math.cos(6.0 * E) * Math.sinh(6.0 * nn);
  const nn4p = h4 * Math.cos(8.0 * E) * Math.sinh(8.0 * nn);
  const Ep = E - E1p - E2p - E3p - E4p;
  const nnp = nn - nn1p - nn2p - nn3p - nn4p;
  const be = Math.asin(Math.sin(Ep) / Math.cosh(nnp));

  const Q = Math.asinh(Math.tan(be));
  let Qp = Q + e * Math.atanh(e * Math.tanh(Q));
  Qp = Q + e * Math.atanh(e * Math.tanh(Qp));
  Qp = Q + e * Math.atanh(e * Math.tanh(Qp));
  Qp = Q + e * Math.atanh(e * Math.tanh(Qp));

  const kkjLat = Math.atan(Math.sinh(Qp));
  const kkjLon = lo0 + Math.asin(Math.tanh(nnp) / Math.cos(be));

  const a_1 = kkjEllipsoid.a;
  const e_1 = kkjEllipsoid.e;
  const a_2 = wgsEllipsoid.a;
  const e_2 = wgsEllipsoid.e;

  const N = a_1 / Math.sqrt(1.0 - (e_1 * Math.sin(kkjLat)) ** 2.0);

  const X = N * Math.cos(kkjLat) * Math.cos(kkjLon);
  const Y = N * Math.cos(kkjLat) * Math.sin(kkjLon);
  const Z = N * (1.0 - e_1 ** 2.0) * Math.sin(kkjLat);

  const dx = -96.0617;
  const dy = -82.4278;
  const dz = -121.7535;
  const ex = toRad(-4.80107 / 3600.0);
  const ey = toRad(-0.34543 / 3600.0);
  const ez = toRad(1.37646 / 3600.0);
  const m = 1.4964 / 1e6;

  const X2 = (1.0 + m) * (X + ez * Y - ey * Z) + dx;
  const Y2 = (1.0 + m) * (Y - ez * X + ex * Z) + dy;
  const Z2 = (1.0 + m) * (ey * X - ex * Y + Z) + dz;
  const X2Y2 = Math.sqrt(X2 ** 2.0 + Y2 ** 2.0);

  const e2 = e_2 ** 2;
  const la0 = Math.atan(Z2 / ((1.0 - e2) * X2Y2));
  let wgsLat = la0;

  let dla = 1.0;
  for (let i = 100; i > 0; i--) {
    if (dla < 1.0e-12) {
      break;
    }
    const Nwgs = a_2 / Math.sqrt(1.0 - e2 * Math.sin(wgsLat) ** 2.0);
    const h =
      Math.abs(la0) < Math.pi / 4.0
        ? X2Y2 / Math.cos(wgsLat) - Nwgs
        : Z2 / Math.sin(wgsLat) - Nwgs * (1.0 - e2);
    const nla = Math.atan(Z2 / (X2Y2 * (1.0 - (Nwgs * e2) / (Nwgs + h))));
    dla = Math.abs(nla - wgsLat);
    wgsLat = nla;
  }

  const wgsLon = toDeg(Math.atan(Y2 / X2));
  wgsLat = toDeg(wgsLat);

  return [wgsLon, wgsLat];
}

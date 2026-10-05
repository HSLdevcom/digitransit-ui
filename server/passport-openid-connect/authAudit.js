/* eslint-disable no-console */
import crypto from 'crypto';

// Auth audit logging. Never logs tokens; session ids and user ids are
// HMAC-hashed so that events can be correlated without exposing identities.
// Disabled by default; set AUTH_AUDIT=true to turn all of it on.
const key = process.env.SESSION_SECRET || 'reittiopas_secret';
const enabled = process.env.AUTH_AUDIT === 'true';

export const hash = value =>
  value
    ? crypto
        .createHmac('sha256', key)
        .update(String(value))
        .digest('hex')
        .slice(0, 12)
    : '-';

// Mobile IPs change often, so only a coarse prefix is logged
const coarseIp = req => {
  const ip = (req.headers['x-forwarded-for'] || req.ip || '')
    .split(',')[0]
    .trim();
  if (ip.includes(':')) {
    return `${ip.split(':').slice(0, 3).join(':')}::/48`;
  }
  return ip ? `${ip.split('.').slice(0, 2).join('.')}.0.0/16` : '-';
};

export function audit(event, req, extra = {}) {
  if (!enabled) {
    return;
  }
  console.log(
    `AUTH_AUDIT ${JSON.stringify({
      event,
      ts: new Date().toISOString(),
      sid: hash(req.sessionID),
      sub: hash(req.user?.data?.sub),
      ip: coarseIp(req),
      ua: req.headers['user-agent'] || '-',
      path: req.path,
      ...extra,
    })}`,
  );
}

// Responses that may set or depend on a session cookie must never be shared
export function privateNoStore(req, res, next) {
  res.set('Cache-Control', 'private, no-store');
  res.vary('Cookie');
  next();
}

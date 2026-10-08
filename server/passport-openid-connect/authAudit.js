/* eslint-disable no-console */
import crypto from 'crypto';
import LRU from 'lru-cache';

// Auth audit logging. Never logs tokens; session ids and user ids are
// HMAC-hashed so that events can be correlated without exposing identities.
// Disabled by default; set AUTH_AUDIT=true to turn all of it on.
const key = process.env.SESSION_SECRET || 'reittiopas_secret';
const enabled = process.env.AUTH_AUDIT === 'true';

// Remembers the last device seen for each session so that we can flag a
// session being used from more than one kind of device. Bounded in size and
// time so it can't grow unbounded on a long-running server.
const lastDeviceBySession = new LRU({
  max: 20000,
  maxAge: 24 * 60 * 60 * 1000,
});

// Coarse device classification, good enough to tell "a different device"
// from "the same browser that auto-updated". Not meant to be a precise UA
// parser.
const classifyDevice = ua => {
  if (!ua) {
    return 'unknown';
  }
  if (ua.includes('iPhone')) {
    return 'iPhone';
  }
  if (ua.includes('iPad')) {
    return 'iPad';
  }
  if (ua.includes('Android')) {
    return ua.includes('Mobile') ? 'Android-mobile' : 'Android-tablet';
  }
  if (ua.includes('Windows')) {
    return 'Windows';
  }
  if (ua.includes('Macintosh')) {
    return 'Mac';
  }
  if (ua.includes('Linux')) {
    return 'Linux-desktop';
  }
  return 'other';
};

// Chrome's major version. Browser devtools device emulation keeps the real
// browser's engine (and thus this version) while only swapping the
// device/OS part of the user-agent string, which is how we tell emulation
// apart from an actual different device running a different engine build.
const chromeBuild = ua => {
  const match = /Chrome\/(\d+)/.exec(ua || '');
  return match ? match[1] : null;
};

// Compares the current request's device against the last one seen for the
// same session. Returns the event name and details to audit when the
// device class changed, or null otherwise. This is what lets "same
// session, two devices" cases be told apart after the fact:
//  - matching engine build across the device-class change strongly suggests
//    the same browser toggling devtools device emulation (benign), while
//  - a differing (or absent on one side) engine build suggests the session
//    is genuinely being used by a different device/browser and deserves a
//    closer look.
const detectDeviceChange = (req, sid) => {
  const ua = req.headers['user-agent'] || '-';
  const deviceClass = classifyDevice(ua);
  const engineBuild = chromeBuild(ua);
  const previous = lastDeviceBySession.get(sid);
  lastDeviceBySession.set(sid, { deviceClass, engineBuild });

  if (!previous || previous.deviceClass === deviceClass) {
    return null;
  }

  const sameBuild =
    previous.engineBuild !== null && previous.engineBuild === engineBuild;

  return {
    event: sameBuild
      ? 'device_class_changed_same_build'
      : 'device_class_changed_diff_build',
    extra: {
      previousDeviceClass: previous.deviceClass,
      deviceClass,
      previousEngineBuild: previous.engineBuild,
      engineBuild,
    },
  };
};

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

const logAuditLine = (event, req, extra) => {
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
};

// Event names logged by detectDeviceChange's result, so it doesn't recurse
// into checking its own output.
const deviceChangeEvents = new Set([
  'device_class_changed_same_build',
  'device_class_changed_diff_build',
]);

export function audit(event, req, extra = {}) {
  if (!enabled) {
    return;
  }
  logAuditLine(event, req, extra);

  if (!deviceChangeEvents.has(event) && req.sessionID) {
    const deviceChange = detectDeviceChange(req, hash(req.sessionID));
    if (deviceChange) {
      logAuditLine(deviceChange.event, req, deviceChange.extra);
    }
  }
}

// Responses that may set or depend on a session cookie must never be shared
export function privateNoStore(req, res, next) {
  res.set('Cache-Control', 'private, no-store');
  res.vary('Cookie');
  next();
}

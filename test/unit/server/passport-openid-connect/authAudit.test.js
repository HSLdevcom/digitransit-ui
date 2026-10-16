// authAudit.js reads process.env.AUTH_AUDIT once at module load time, and
// keeps an in-memory, module-level LRU cache of the last device seen per
// session. Each test therefore re-imports a fresh module instance (see
// vitest.config.js's isolate: false for the jsdom project, which otherwise
// shares module state across test files/tests in the same worker).
const MAC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36';
const ANDROID_SAME_BUILD_UA =
  'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36';
const ANDROID_DIFFERENT_BUILD_UA =
  'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36';
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';

function buildReq(sessionID, userAgent) {
  return {
    sessionID,
    headers: { 'user-agent': userAgent },
    path: '/api/user',
    ip: '127.0.0.1',
  };
}

function auditedEvents(consoleSpy) {
  return consoleSpy.mock.calls
    .map(([line]) => line)
    .filter(line => line.startsWith('AUTH_AUDIT '))
    .map(line => JSON.parse(line.slice('AUTH_AUDIT '.length)));
}

describe('authAudit', () => {
  let consoleSpy;

  beforeEach(async () => {
    vi.resetModules();
    process.env.AUTH_AUDIT = 'true';
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    delete process.env.AUTH_AUDIT;
  });

  it('does not log a device-change event for the first request on a session', async () => {
    const { audit } = await import(
      '../../../../server/passport-openid-connect/authAudit'
    );
    audit('api_user', buildReq('sid-1', MAC_UA));

    const events = auditedEvents(consoleSpy);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('api_user');
  });

  it('does not log a device-change event when the device class is unchanged', async () => {
    const { audit } = await import(
      '../../../../server/passport-openid-connect/authAudit'
    );
    audit('api_user', buildReq('sid-1', MAC_UA));
    audit('api_user', buildReq('sid-1', MAC_UA));

    const events = auditedEvents(consoleSpy);
    expect(events).toHaveLength(2);
    expect(events.every(e => e.event === 'api_user')).toBe(true);
  });

  it('flags a same-build device class change as likely devtools emulation', async () => {
    const { audit } = await import(
      '../../../../server/passport-openid-connect/authAudit'
    );
    audit('api_user', buildReq('sid-1', MAC_UA));
    audit('api_user', buildReq('sid-1', ANDROID_SAME_BUILD_UA));

    const events = auditedEvents(consoleSpy);
    expect(events).toHaveLength(3);
    expect(events[2].event).toBe('device_class_changed_same_build');
    expect(events[2].previousDeviceClass).toBe('Mac');
    expect(events[2].deviceClass).toBe('Android-mobile');
    expect(events[2].previousEngineBuild).toBe('154');
    expect(events[2].engineBuild).toBe('154');
  });

  it('flags a different-build device class change as a closer-look case', async () => {
    const { audit } = await import(
      '../../../../server/passport-openid-connect/authAudit'
    );
    audit('api_user', buildReq('sid-1', MAC_UA));
    audit('api_user', buildReq('sid-1', ANDROID_DIFFERENT_BUILD_UA));

    const events = auditedEvents(consoleSpy);
    expect(events).toHaveLength(3);
    expect(events[2].event).toBe('device_class_changed_diff_build');
    expect(events[2].previousEngineBuild).toBe('154');
    expect(events[2].engineBuild).toBe('151');
  });

  it('flags a device class change when one side has no engine build (e.g. iOS Safari)', async () => {
    const { audit } = await import(
      '../../../../server/passport-openid-connect/authAudit'
    );
    audit('api_user', buildReq('sid-1', MAC_UA));
    audit('api_user', buildReq('sid-1', IPHONE_UA));

    const events = auditedEvents(consoleSpy);
    expect(events).toHaveLength(3);
    expect(events[2].event).toBe('device_class_changed_diff_build');
    expect(events[2].previousEngineBuild).toBe('154');
    expect(events[2].engineBuild).toBeNull();
  });

  it('keeps per-session device history independent across sessions', async () => {
    const { audit } = await import(
      '../../../../server/passport-openid-connect/authAudit'
    );
    audit('api_user', buildReq('sid-1', MAC_UA));
    audit('api_user', buildReq('sid-2', IPHONE_UA));

    const events = auditedEvents(consoleSpy);
    expect(events).toHaveLength(2);
    expect(events.every(e => e.event === 'api_user')).toBe(true);
  });

  it('logs nothing at all when auditing is disabled', async () => {
    process.env.AUTH_AUDIT = 'false';
    const { audit } = await import(
      '../../../../server/passport-openid-connect/authAudit'
    );
    audit('api_user', buildReq('sid-1', MAC_UA));
    audit('api_user', buildReq('sid-1', IPHONE_UA));

    expect(auditedEvents(consoleSpy)).toHaveLength(0);
  });
});

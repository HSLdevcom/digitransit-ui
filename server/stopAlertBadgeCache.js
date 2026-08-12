const SEVERITY_RANK = {
  SEVERE: 3,
  WARNING: 2,
  UNKNOWN_SEVERITY: 1,
  INFO: 0,
};

const BADGE_IMGS = {
  OUT_OF_SERVICE: 'icon_stop-closed-badge',
  ALERT: 'icon_caution-badge',
  INFO: 'icon_info-circled-badge',
};

// Lower number = higher priority.
const BADGE_PRIORITY = {
  [BADGE_IMGS.OUT_OF_SERVICE]: 0,
  [BADGE_IMGS.ALERT]: 1,
  [BADGE_IMGS.INFO]: 2,
};

// Module-level map refreshed by the background job: { gtfsId: badgeImg }
let badgeMap = {};

function buildBadgeMap(alerts, nowUnixTime) {
  const result = {};

  function applyBadge(gtfsId, alertEffect, alertSeverityLevel) {
    if (!gtfsId) {
      return;
    }
    const existing = result[gtfsId];
    const closedByAlert = alertEffect === 'NO_SERVICE';
    const severityRank = SEVERITY_RANK[alertSeverityLevel] ?? -1;
    let badge;
    if (closedByAlert) {
      badge = BADGE_IMGS.OUT_OF_SERVICE;
    } else if (severityRank === SEVERITY_RANK.INFO) {
      badge = BADGE_IMGS.INFO;
    } else if (severityRank > SEVERITY_RANK.INFO) {
      badge = BADGE_IMGS.ALERT;
    }
    if (!badge) {
      return;
    }
    // Keep the higher-priority badge; lower BADGE_PRIORITY number wins.
    const existingRank =
      existing !== undefined ? BADGE_PRIORITY[existing] : Infinity;
    if (BADGE_PRIORITY[badge] <= existingRank) {
      result[gtfsId] = badge;
    }
  }

  alerts.forEach(alert => {
    if (
      alert.effectiveStartDate > nowUnixTime ||
      alert.effectiveEndDate < nowUnixTime
    ) {
      return;
    }
    (alert.entities || []).forEach(entity => {
      // eslint-disable-next-line no-underscore-dangle
      if (entity.__typename === 'Stop') {
        applyBadge(entity.gtfsId, alert.alertEffect, alert.alertSeverityLevel);
      }
    });
  });
  return result;
}

async function fetchAndRefresh(otpUrl, feedIds, queryParameters) {
  const query = `{
    alerts(feeds: ${JSON.stringify(feedIds)}) {
      alertEffect
      alertSeverityLevel
      effectiveStartDate
      effectiveEndDate
      entities {
        __typename
        ... on Stop { gtfsId }
      }
    }
  }`;

  const url = `${otpUrl}gtfs/v1${queryParameters}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    throw new Error(`OTP responded with ${response.status}`);
  }
  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  const alerts = json?.data?.alerts || [];
  const nowUnixTime = Date.now() / 1000;
  badgeMap = buildBadgeMap(alerts, nowUnixTime);
  // eslint-disable-next-line no-console
  console.log(
    `[stopAlertBadgeCache] Loaded ${
      Object.keys(badgeMap).length
    } stop badges from ${alerts.length} alerts`,
  );
}

module.exports = {
  setupStopAlertBadgeCache(app, config) {
    if (!config.showStopStatusMarkers || !config.feedIds?.length) {
      return;
    }

    const queryParameters = config.hasAPISubscriptionQueryParameter
      ? `?${config.API_SUBSCRIPTION_QUERY_PARAMETER_NAME}=${config.API_SUBSCRIPTION_TOKEN}`
      : '';

    async function refresh() {
      try {
        await fetchAndRefresh(config.URL.OTP, config.feedIds, queryParameters);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[stopAlertBadgeCache] Fetch failed:', err.message);
      }
    }

    refresh();
    // Refresh the badge map once per day.
    setInterval(refresh, 24 * 60 * 60 * 1000);

    // 5-minute HTTP cache lets the browser reuse the response within a session.
    app.get('/api/stop-alert-badges', (req, res) => {
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.json(badgeMap);
    });
  },
};

import distance from '@digitransit-search-util/digitransit-search-util-distance';
import cx from 'classnames';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { GeodeticToEnu } from '../../../util/geo-utils';
import { legTime, legTimeAcc } from '../../../util/legUtils';
import {
  getRouteMode,
  getStopMode,
  transitIconName,
} from '../../../util/modeUtils';
import { locationToUri } from '../../../util/otpStrings';
import { getItineraryPagePath } from '../../../util/path';
import { durationToString, epochToIso, timeStr } from '../../../util/timeUtils';
import Icon from '../../Icon';
import { getModeIconColor } from '../../../util/colorUtils';
import RouteNumberContainer from '../../RouteNumberContainer';
import Duration from '../Duration';
import {
  formatFare,
  getFaresFromLegs,
  shouldShowFareInfo,
} from '../../../util/fareUtils';

const DISPLAY_MESSAGE_THRESHOLD = 120 * 1000; // 2 minutes
const EARLIEST_NEXT_STOP = 60 * 1000;
const NOTED_SEVERITY = ['WARNING', 'ALERT'];

export const DESTINATION_RADIUS = 20; // meters
export const ACCEPT_LOCATION_RADIUS = 1000;

export const LEGTYPE = {
  WAIT: 'WAIT',
  MOVE: 'MOVE',
  TRANSIT: 'TRANSIT',
  PENDING: 'PENDING',
  END: 'END',
  WAIT_IN_VEHICLE: 'WAIT_IN_VEHICLE',
};

export function summaryString(legs, time, previousLeg, currentLeg, nextLeg) {
  const parts = epochToIso(time).split('T')[1].split('+');
  let msg = `${parts[0]} `;
  const colors = [];

  legs.forEach(l => {
    let color = 'color:gray';
    if (legTime(l.start) <= time && time <= legTime(l.end)) {
      color = 'color:green';
    } else if (l.transitLeg) {
      color = 'color:pink';
    }
    colors.push(l.freezeStart ? 'color:lightblue' : color);
    msg += `%c${legTimeAcc(l.start)}`;
    colors.push('color:gray');
    msg += `%c-`;
    colors.push(l.freezeEnd ? 'color:lightblue' : color);
    msg += `%c${legTimeAcc(l.end)} `;
  });
  colors.push('color:gray');
  msg += `%c${previousLeg?.mode} ${currentLeg?.mode} ${nextLeg?.mode}`;
  colors.unshift(msg);

  return colors;
}

function dist(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function vSub(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return { dx, dy };
}

// compute how big part of a path has been traversed
// returns position's projection to path, distance from path
// and the ratio traversed/full length
export function pathProgress(pos, geom) {
  const lengths = [];

  let p1 = geom[0];
  let dst = dist(pos, p1);
  let minI = 0;
  let minF = 0;
  let totalLength = 0;

  for (let i = 0; i < geom.length - 1; i++) {
    const p2 = geom[i + 1];
    const { dx, dy } = vSub(p2, p1);
    const d = Math.sqrt(dx * dx + dy * dy);
    lengths.push(d);
    totalLength += d;

    if (d > 0.001) {
      // interval distance in meters, safety check
      const dlt = vSub(pos, p1);
      const dp = dlt.dx * dx + dlt.dy * dy; // dot prod

      if (dp > 0) {
        let f;
        let cDist;
        if (dp > 1) {
          cDist = dist(p2, pos);
          f = 1;
        } else {
          f = dp / d; // normalize
          cDist = Math.sqrt(dlt.x * dlt.x + dlt.y * dlt.y - f * f); // pythag.
        }
        if (cDist < dst) {
          dst = cDist;
          minI = i;
          minF = f;
        }
      }
    }
    p1 = p2;
  }

  let traversed = minF * lengths[minI]; // last partial segment
  for (let i = 0; i < minI; i++) {
    traversed += lengths[i];
  }
  traversed /= totalLength;
  const { dx, dy } = vSub(geom[minI + 1], geom[minI]);
  const projected = {
    x: geom[minI].x + minF * dx,
    y: geom[minI].y + minF * dy,
  };

  return { projected, orthogonalDistance: dst, traversed };
}

export function getRemainingTraversal(leg, pos, origin, time) {
  if (pos) {
    const posXY = GeodeticToEnu(pos.lat, pos.lon, origin);
    const { traversed, orthogonalDistance } = pathProgress(posXY, leg.geometry);
    if (orthogonalDistance < ACCEPT_LOCATION_RADIUS) {
      return 1.0 - traversed;
    }
  }
  // estimate from elapsed time
  const duration = Math.max(legTime(leg.end) - legTime(leg.start), 1); // min 1 ms
  return Math.min(Math.max((legTime(leg.end) - time) / duration, 0), 1.0);
}

export function legTraversal(leg, origin, pos) {
  const posXY = GeodeticToEnu(pos.lat, pos.lon, origin);
  const { traversed, orthogonalDistance } = pathProgress(posXY, leg.geometry);
  const metersToGo = (1.0 - traversed) * leg.distance;

  return orthogonalDistance > ACCEPT_LOCATION_RADIUS
    ? null
    : { traversed, metersToGo };
}

function transferId(transfer) {
  return `transfer-${transfer.fromLeg.legId}-${transfer.toLeg.legId}`;
}

function findTransferProblems(legs, time, position, tailLength, slack) {
  const transfers = [];

  for (let i = 1; i < legs.length - 1; i++) {
    const prev = legs[i - 1];
    const leg = legs[i];
    const next = legs[i + 1];

    if (prev.transitLeg && leg.transitLeg && !leg.interlineWithPreviousLeg) {
      // transfer at a stop
      const start = legTime(leg.start);
      const end = legTime(prev.end);
      if (start > time) {
        const duration = start - end;
        let severity;
        if (start < end) {
          severity = 'ALERT';
        } else if (duration < slack) {
          severity = 'WARNING';
        } else {
          severity = 'INFO'; // normal transfer
        }
        transfers.push({
          severity,
          fromLeg: prev,
          toLeg: leg,
          duration,
          slack: duration,
          originalDuration:
            legTime(leg.originalStart) - legTime(prev.originalEnd),
        });
      }
    }

    if (prev.transitLeg && next.transitLeg && !leg.transitLeg) {
      // transfer with some walking
      const t1 = legTime(prev.end);
      const t2 = legTime(next.start);
      const duration = t2 - t1;
      const originalDuration =
        legTime(next.originalStart) - legTime(prev.originalEnd);
      if (t2 > time) {
        // transfer is not over yet
        if (t1 > t2) {
          // certain failure, next transit departs before previous arrives
          transfers.push({
            severity: 'ALERT',
            fromLeg: prev,
            toLeg: next,
          });
        } else {
          const legDuration = leg.duration * 1000; // this is original duration
          // check if user is already at the next departure stop
          const atStop =
            position && distance(position, leg.to) <= DESTINATION_RADIUS;
          let currentSlack = duration - legDuration;
          if (!atStop && currentSlack < slack) {
            // original transfer not possible
            let severity = 'WARNING';
            let toGo;
            let timeLeft;
            // has transit walk already started ?
            if (time > legTime(leg.start)) {
              // compute how transit is proceeding
              toGo = tailLength;
              timeLeft = (t2 - time) / 1000;
            } else {
              toGo = leg.distance;
              timeLeft = duration / 1000; // should we consider also transfer slack here?
            }
            if (toGo > 0) {
              const originalSpeed = leg.distance / leg.duration;
              const newSpeed = toGo / (timeLeft + 0.0001);
              if (newSpeed > 1.5 * originalSpeed) {
                // too high speed compared to user's routing preference
                severity = 'ALERT';
              }
            }
            transfers.push({
              severity,
              fromLeg: prev,
              toLeg: next,
              duration,
              originalDuration,
            });
          } else {
            if (atStop) {
              currentSlack *= 2; // no slack prob if at stop
            }
            transfers.push({
              severity: 'INFO',
              fromLeg: prev,
              toLeg: next,
              duration,
              originalDuration,
              slack: currentSlack,
            });
          }
        }
      }
    }
  }
  return transfers;
}

export const getLocalizedMode = (mode, intl) => {
  return intl.formatMessage({
    id: `${mode.toLowerCase()}`,
    defaultMessage: `${mode}`,
  });
};

export const getToLocalizedMode = (mode, intl) => {
  return intl.formatMessage({
    id: `to-${mode.toLowerCase()}`,
    defaultMessage: `${mode}`,
  });
};

export const getAdditionalMessages = (
  leg,
  nextLeg,
  firstLeg,
  time,
  config,
  messages,
  intl,
  legs,
) => {
  // Todo: multiple fares?
  const fare = getFaresFromLegs([nextLeg], config)?.find(f => !f.isUnknown);
  const isTicketSaleActive =
    !config.hideNaviTickets && shouldShowFareInfo(config, legs) && fare;

  const msgs = [];
  const closed = messages.get('ticket')?.closed;
  if (
    !closed &&
    leg === firstLeg &&
    legTime(leg.end) - time < DISPLAY_MESSAGE_THRESHOLD &&
    isTicketSaleActive
  ) {
    // Todo: multiple fares?
    const fares = getFaresFromLegs([nextLeg], config);

    if (fares?.length && !fares[0].isUnknown) {
      const title = intl.formatMessage({ id: 'navigation-remember-ticket' });
      const body = `${fares[0].ticketName} ${formatFare(fares[0])}`;

      msgs.push({
        severity: 'INFO',
        id: 'ticket',
        title,
        body,
      });
    }
  }
  return msgs;
};

export const getTransitLegState = (leg, intl, messages, time, settings) => {
  const { start, realtimeState, from, mode, legId, route } = leg;
  const { scheduledTime, estimated } = start;
  if (messages.get(legId)?.closed) {
    return [];
  }
  const slack = settings.minTransferTime * 1000;
  const notInSchedule = estimated?.delay > slack || estimated?.delay < -slack;
  const localizedMode = getLocalizedMode(mode, intl);
  let content;
  let title;
  let body = '';
  let severity;
  const isRealTime = realtimeState === 'UPDATED';
  const shortName = route.shortName || '';

  if (notInSchedule) {
    const lMode = getLocalizedMode(mode, intl);
    const routeName = `${lMode} ${shortName}`;
    const { delay } = estimated;

    const translationId = `navigation-mode-${delay > 0 ? 'late' : 'early'}`;
    title = intl.formatMessage({ id: translationId }, { name: routeName });
    severity = 'WARNING';
  } else if (!isRealTime) {
    const departure = leg.trip.stoptimesForDate[0];
    const departed =
      1000 * (departure.serviceDay + departure.scheduledDeparture);
    if (time + DISPLAY_MESSAGE_THRESHOLD < departed) {
      // vehicle just departed, maybe no realtime yet
      severity = 'INFO';
    } else {
      severity = 'WARNING';
    }
    title = intl.formatMessage({ id: 'navileg-mode-schedule' });
    body = intl.formatMessage(
      { id: 'navileg-start-schedule' },
      {
        route: shortName,
        time: timeStr(scheduledTime),
        mode: localizedMode,
      },
    );
  } else {
    const { parentStation, name } = from.stop;

    const fromId = // eslint-disable-next-line no-nested-ternary
      mode === 'FERRY'
        ? 'from-ferrypier'
        : parentStation
          ? 'from-station'
          : 'from-stop';
    const stopOrStation = intl.formatMessage({ id: fromId });
    title = intl.formatMessage(
      { id: 'navileg-mode-realtime' },
      { route: shortName, mode: localizedMode },
    );
    body = intl.formatMessage(
      { id: 'navileg-start-realtime' },
      {
        time: timeStr(estimated.time),
        stopOrStation,
        stopName: name,
      },
    );
    severity = 'INFO';
  }

  return [
    {
      severity,
      content,
      id: legId,
      expiresOn: legTime(start),
      title,
      body,
    },
  ];
};

export function itinerarySearchPath(time, leg, nextLeg, position, to) {
  let from;
  if (leg?.transitLeg) {
    from = leg.intermediatePlaces.find(
      p => legTime(p.arrival) > time + EARLIEST_NEXT_STOP,
    );
    if (!from) {
      from = leg.to;
    }
  } else {
    from = position || leg?.to || nextLeg?.from;
  }
  const location = { ...from, ...from.stop };

  return getItineraryPagePath(locationToUri(location), to);
}

function withNewSearchBtn(children, searchCallback, alertType) {
  addAnalyticsEvent({
    category: 'Itinerary',
    event: 'navigator',
    action: 'notification_alert',
  });

  const handleClick = callback => () => {
    addAnalyticsEvent({
      category: 'Itinerary',
      event: 'navigator',
      action: 'notification_alert_click',
      type: alertType,
    });
    callback();
  };

  return (
    <div className="navi-info-content">
      {children}
      <FormattedMessage id="navigation-abort-trip" />
      <button
        className="new-itinerary-search"
        type="button"
        onClick={handleClick(searchCallback)}
      >
        <span className="notification-header">
          <FormattedMessage id="settings-dropdown-open-label" />
        </span>
      </button>
    </div>
  );
}

function Transfer(route1, route2, config) {
  const mode1 = getRouteMode(route1, config);
  const mode2 = getRouteMode(route2, config);

  return (
    <span className="navi-transfer-container">
      <div className="navi-transfer">
        <RouteNumberContainer
          className={cx('line', mode1)}
          route={route1}
          mode={mode1}
          isTransitLeg
          vertical
          withBar
        />
        &nbsp;
        <div className="arrow-center">
          <Icon img="icon_arrow-right" omitViewBox />
        </div>
        &nbsp;
        <RouteNumberContainer
          className={cx('line', mode2)}
          route={route2}
          mode={mode2}
          isTransitLeg
          vertical
          withBar
        />
      </div>
    </span>
  );
}

function TransferText(route1, route2, config, intl) {
  const from = `${getLocalizedMode(getRouteMode(route1, config), intl)} ${
    route1.shortName || ''
  }`;
  const to = `${getLocalizedMode(getRouteMode(route2, config), intl)} ${
    route2.shortName || ''
  }`;
  return `${from} -> ${to}`;
}

export const getItineraryAlerts = (
  legs,
  time,
  position,
  tailLength,
  intl,
  messages,
  itinerarySearchCallback,
  config,
  settings,
) => {
  const alerts = [];
  const slack = settings.minTransferTime * 1000;
  legs.forEach(leg => {
    if (leg.transitLeg && legTime(leg.end) > time) {
      const id = `alert-${leg.legId}`; // allow only one alert per leg
      if (!messages.get(id)?.closed) {
        const alert = leg.alerts.find(al => {
          return (
            // show only alerts that are active during the leg
            legTime(leg.end) / 1000 > al.effectiveStartDate &&
            legTime(leg.start) / 1000 < al.effectiveEndDate &&
            NOTED_SEVERITY.includes(al.alertSeverityLevel)
          );
        });
        if (alert) {
          alerts.push({
            severity: 'ALERT',
            id,
            title: alert.alertHeaderText,
            body: '',
          });
        }
      }
    }
  });

  const canceled = legs.filter(
    leg => leg.realtimeState === 'CANCELED' && legTime(leg.start) > time,
  );

  if (canceled.length) {
    // show new itinerary search button only for first canceled leg
    canceled.forEach((leg, i) => {
      const { legId, mode, route } = leg;
      const id = `canceled-${legId}`;
      if (!messages.get(id)) {
        const lMode = getLocalizedMode(mode, intl);
        const routeName = `${lMode} ${route.shortName}`;
        const title = intl.formatMessage(
          { id: 'navigation-mode-canceled' },
          { name: routeName },
        );
        const jsxBody =
          i === 0
            ? withNewSearchBtn(
                '',
                itinerarySearchCallback,
                `canceled_${route.shortName}${mode.toLowerCase()}`,
              )
            : undefined;
        alerts.push({
          severity: 'ALERT',
          id,
          hideClose: true,
          expiresOn: alert.effectiveEndDate * 1000,
          title,
          body: '',
          jsxBody,
        });
      }
    });
  } else {
    const transfers = findTransferProblems(
      legs,
      time,
      position,
      tailLength,
      slack,
    );
    if (transfers.length) {
      let title;
      let body;
      let jsxBody;
      const prob =
        transfers.find(p => p.severity === 'ALERT') ||
        transfers.find(p => p.severity === 'WARNING');
      if (prob) {
        const id = transferId(prob);
        const alert = messages.get(id);
        if (!alert?.closed || alert?.severity !== prob.severity) {
          const transfer = Transfer(
            prob.fromLeg.route,
            prob.toLeg.route,
            config,
          );
          const desc = TransferText(
            prob.fromLeg.route,
            prob.toLeg.route,
            config,
            intl,
          );

          if (prob.severity === 'ALERT') {
            title = intl.formatMessage({ id: 'navigation-transfer-problem' });
            body = intl.formatMessage(
              { id: 'navigation-transfer-problem-details' },
              { transfer: desc },
            );
            jsxBody = withNewSearchBtn(
              <FormattedMessage
                id="navigation-transfer-problem-details"
                values={{ transfer }}
              />,
              itinerarySearchCallback,
              `transfer-${
                prob.fromLeg.route.shortName
              }${prob.fromLeg.mode.toLowerCase()}-${
                prob.toLeg.route.shortName
              }${prob.toLeg.mode.toLowerCase()}`,
            );
          } else {
            title = intl.formatMessage({ id: 'navigation-hurry-transfer' });
            const change = Math.floor(
              (prob.duration - prob.originalDuration) / 60000,
            );

            body = intl.formatMessage(
              { id: 'navigation-hurry-transfer-value' },
              { transfer: desc, time: durationToString(prob.duration), change },
            );
            jsxBody = (
              <FormattedMessage
                id="navigation-hurry-transfer-value"
                values={{
                  transfer,
                  time: <Duration duration={prob.duration} />,
                  change,
                }}
              />
            );
          }

          alerts.push({
            severity: prob.severity,
            id,
            hideClose: prob.severity === 'ALERT',
            expiresOn: legTime(prob.toLeg.start),
            title,
            body,
            jsxBody,
          });
        }
      }
      // show notification when problem gets solved
      transfers.forEach(tr => {
        if (tr.severity === 'INFO' && tr.slack > 1.1 * slack) {
          const id = transferId(tr);
          const alert = messages.get(id);
          if (alert && alert.severity !== 'INFO') {
            title = intl.formatMessage({
              id: 'navigation-hurry-transfer-solved',
            });
            body = intl.formatMessage(
              { id: 'navigation-hurry-transfer-solved-details' },
              {
                transfer: TransferText(
                  tr.fromLeg.route,
                  tr.toLeg.route,
                  config,
                  intl,
                ),
                time: durationToString(tr.duration),
              },
            );
            jsxBody = (
              <FormattedMessage
                id="navigation-hurry-transfer-solved-details"
                values={{
                  transfer: Transfer(tr.fromLeg.route, tr.toLeg.route, config),
                  time: <Duration duration={tr.duration} />,
                }}
              />
            );

            // a warning/alert has been shown
            alerts.push({
              severity: 'INFO',
              id,
              expiresOn: legTime(tr.toLeg.start),
              title,
              body,
              jsxBody,
            });
          }
        }
      });
    }
  }
  return alerts;
};

/*
 * Get the properties of the destination based on the leg.
 *
 */

export const getDestinationProperties = (
  rentalVehicle,
  vehicleParking,
  vehicleRentalStation,
  stop,
  config,
) => {
  const { routes, vehicleMode, code } = stop;
  let destination = {};
  const mode = getStopMode(vehicleMode, routes, code, config);
  // todo: scooter and citybike icons etc.
  if (rentalVehicle) {
    destination.name = rentalVehicle.rentalNetwork.networkId;
  } else if (vehicleParking) {
    destination.name = vehicleParking.name;
  } else if (vehicleRentalStation) {
    destination.name = vehicleRentalStation.name;
  } else {
    destination = {
      className: mode,
      iconId: transitIconName(mode, mode !== 'ferry'),
      iconColor: getModeIconColor(config, mode),
      name: stop.name,
    };
  }

  return destination;
};

export const withRealTime = (rt, children) => (
  <span className={cx({ bold: rt, realtime: rt })}>{children}</span>
);

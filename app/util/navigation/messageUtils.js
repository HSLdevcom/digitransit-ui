import React from 'react';
import { FormattedMessage } from 'react-intl';
import { legTime } from '../legUtils';
import { timeStr } from '../timeUtils';

const TRANSFER_SLACK = 60000;

function findTransferProblem(legs) {
  for (let i = 1; i < legs.length - 1; i++) {
    const prev = legs[i - 1];
    const leg = legs[i];
    const next = legs[i + 1];

    if (prev.transitLeg && leg.transitLeg && !leg.interlineWithPreviousLeg) {
      // transfer at a stop
      if (legTime(leg.start) - legTime(prev.end) < TRANSFER_SLACK) {
        return [prev, leg];
      }
    }

    if (prev.transitLeg && next.transitLeg && !leg.transitLeg) {
      // transfer with some walking
      const t1 = legTime(prev.end);
      const t2 = legTime(next.start);
      const transferDuration = legTime(leg.end) - legTime(leg.start);
      const slack = t2 - t1 - transferDuration;
      if (slack < TRANSFER_SLACK) {
        return [prev, next];
      }
    }
  }
  return null;
}

export const getScheduleInfo = (nextLeg, intl) => {
  const { start, realtimeState, to, from, mode, id } = nextLeg;
  const { scheduledTime, estimated } = start;
  if (mode === 'WALK') {
    return null;
  }

  const time = estimated?.time || scheduledTime;
  let msgId = id || `${mode.toLowerCase()}-${time}`;

  const late = estimated?.delay > 0;
  const localizedMode = intl.formatMessage({
    id: `${mode.toLowerCase()}`,
    defaultMessage: `${mode}`,
  });
  let content;
  let severity;
  if (mode === 'BICYCLE' && from.vehicleRentalStation) {
    const bikes = from.vehicleRentalStation.availableVehicles?.total;
    msgId += `-${bikes}`;
    content = (
      <div className="navi-info-content">
        <FormattedMessage
          id="navileg-mode-citybike"
          values={{ available: bikes }}
        />
      </div>
    );
    severity = 'INFO';
  } else if (late) {
    // todo: Do this when design is ready.
    severity = 'ALERT';
    content = <div className="navi-info-content"> Kulkuneuvo on myöhässä </div>;
  } else if (!realtimeState || realtimeState !== 'UPDATED') {
    severity = 'WARNING';
    content = (
      <div className="navi-info-content">
        <FormattedMessage id="navileg-mode-schedule" />
        <FormattedMessage
          id="navileg-start-schedule"
          values={{
            time: timeStr(scheduledTime),
            mode: localizedMode,
          }}
        />
      </div>
    );
  } else if (nextLeg.transitLeg) {
    const { parentStation, name } = to.stop;
    const stopOrStation = parentStation
      ? intl.formatMessage({ id: 'from-station' })
      : intl.formatMessage({ id: 'from-stop' });

    content = (
      <div className="navi-info-content">
        <FormattedMessage
          id="navileg-mode-realtime"
          values={{ mode: localizedMode }}
        />
        <FormattedMessage
          id="navileg-start-realtime"
          values={{
            time: timeStr(estimated.time),
            stopOrStation,
            stopName: name,
          }}
        />
      </div>
    );
    severity = 'INFO';
  }
  const info = { severity, content, id: msgId };
  // Only one main info, first in stack.
  info.type = 'main';
  return info;
};

// We'll need the intl later.
// eslint-disable-next-line no-unused-vars
export const getAlerts = (realTimeLegs, intl) => {
  const alerts = [];
  const canceled = realTimeLegs.filter(leg => leg.realtimeState === 'CANCELED');
  const transferProblem = findTransferProblem(realTimeLegs);
  const late = realTimeLegs.filter(leg => leg.start.estimate?.delay > 0);
  let content;
  const id = 'alert-todo-proper-id';
  if (canceled.length > 0) {
    content = <div className="notifiler">Osa matkan lähdöistä on peruttu</div>;
    // Todo: No current design
    // todo find modes that are canceled
    alerts.push({
      severity: 'ALERT',
      content,
      id,
    });
  }

  if (transferProblem !== null) {
    // todo no current design
    content = (
      <div className="notifiler">{`Vaihto ${transferProblem[0].route.shortName} - ${transferProblem[1].route.shortName} ei onnistu reittisuunnitelman mukaisesti`}</div>
    );

    alerts.push({
      severity: 'ALERT',
      content,
      id,
    });
  }
  if (late.length) {
    // Todo: No current design
    // Todo add mode and delay time to this message
    content = <div className="notifiler">Kulkuneuvo on myöhässä</div>;
    alerts.push({
      severity: 'ALERT',
      content,
      id,
    });
  }

  return alerts;
};

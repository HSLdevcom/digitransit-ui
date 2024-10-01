import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import { itineraryShape, legShape, configShape } from '../../util/shapes';
import { legTime, legTimeStr } from '../../util/legUtils';
import NaviLeg from './NaviLeg';
import Icon from '../Icon';
import NaviStack from './NaviStack';
import { timeStr } from '../../util/timeUtils';

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
const getScheduleInfo = (nextLeg, intl) => {
  const { start, realtimeState, to, mode } = nextLeg;
  const { estimatedTime, scheduledTime, estimated } = start;
  const late = estimated?.delay > 0;

  const localizedMode = intl.formatMessage({
    id: `${mode.toLowerCase()}`,
    defaultMessage: `${mode}`,
  });

  if (late) {
    // todo: Do this when design is ready.
    return {
      content: (
        <div className="navi-info-content"> Kulkuneuvo on myöhässä </div>
      ),
      backgroundColor: '#FFF8E8',
      iconColor: '#FED100',
      iconId: 'icon-icon_info',
    };
  }
  if (!realtimeState !== 'UPDATED') {
    return {
      content: (
        <div className="navi-info-content">
          <FormattedMessage id="navileg-mode-schedule" />
          <FormattedMessage
            id="navileg-start-schedule"
            values={{
              time: timeStr(scheduledTime),
              mode: localizedMode,
            }}
          />{' '}
        </div>
      ),
      backgroundColor: '#FFF8E8',
      iconColor: '#FED100',
      iconId: 'icon-icon_info',
    };
  }
  if (nextLeg.transitLeg) {
    const { parentStation, name } = to.stop;

    const stopOrStation = parentStation
      ? intl.formatMessage({ id: 'from-station' })
      : intl.formatMessage({ id: 'from-stop' });

    return {
      content: (
        <div className="navi-info-content">
          <FormattedMessage id="navileg-mode-realtime" values={{ mode }} />
          <FormattedMessage
            id="navileg-start-realtime"
            values={{
              time: timeStr(estimatedTime),
              stopOrStation,
              stopName: name,
            }}
          />
        </div>
      ),
      backgroundColor: '##0074BF',
      iconColor: '#FFF',
      iconId: 'icon-icon_info',
    };
  }
  return null;
};

// We'll need the intl later.
// eslint-disable-next-line no-unused-vars
const getAlerts = (realTimeLegs, intl) => {
  const alerts = [];
  const canceled = realTimeLegs.filter(leg => leg.realtimeState === 'CANCELED');
  const transferProblem = findTransferProblem(realTimeLegs);
  const late = realTimeLegs.filter(leg => leg.start.estimate?.delay > 0);

  if (canceled.length > 0) {
    // Todo: No current design
    // todo find modes that are canceled
    alerts.push({
      content: <div className="notifiler">Osa matkan lähdöistä on peruttu</div>,
      backgroundColor: '#DC0451',
      iconColor: '#888',
      iconId: 'icon-icon_caution_white_exclamation',
    });
  }

  if (transferProblem !== null) {
    // todo no current design
    alerts.push({
      content: (
        <div className="notifiler">{`Vaihto ${transferProblem[0].route.shortName} - ${transferProblem[1].route.shortName} ei onnistu reittisuunnitelman mukaisesti`}</div>
      ),
      iconId: 'icon-icon_caution_white_exclamation',
      iconColor: '#888',
    });
  }
  if (late.length) {
    // Todo: No current design
    // Todo add mode and delay time to this message
    alerts.push({
      content: <div className="notifiler">Kulkuneuvo on myöhässä</div>,
      backgroundColor: '#FDF3F6',
      iconColor: '#DC0451',
      iconId: 'icon-icon_delay',
    });
  }

  return alerts;
};

function NaviTop(
  { itinerary, focusToLeg, time, realTimeLegs },
  { intl, config },
) {
  const [currentLeg, setCurrentLeg] = useState(null);
  const [show, setShow] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const handleClick = () => {
    setShow(!show);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  let nextLeg;
  useEffect(() => {
    const newLeg = realTimeLegs.find(leg => {
      return legTime(leg.start) <= time && time <= legTime(leg.end);
    });
    const notifs = [];
    if (newLeg?.id !== currentLeg?.id) {
      if (newLeg) {
        if (!newLeg.transitLeg) {
          // When the component is first rendered, there is no currentLeg
          const l = currentLeg || newLeg;
          nextLeg = itinerary.legs.find(
            leg => legTime(leg.start) > legTime(l.start),
          );
        }
        setCurrentLeg(newLeg);
        focusToLeg(newLeg, false);
        if (nextLeg) {
          notifs.push(getScheduleInfo(nextLeg, intl));
        }
      }
    }
    const problems = getAlerts(realTimeLegs, intl);
    if (problems.length > 0) {
      notifs.push(problems);
    }
    if (notifs.length > 0) {
      const combinedNotifications = notifications.concat(...notifs);
      setNotifications(combinedNotifications);
      setShow(true);
    }
  }, [time]);

  const first = realTimeLegs[0];
  const last = realTimeLegs[realTimeLegs.length - 1];

  let info;
  if (time < legTime(first.start)) {
    info = (
      <FormattedMessage
        id="navigation-journey-start"
        values={{ time: legTimeStr(first.start) }}
      />
    );
  } else if (currentLeg) {
    if (!currentLeg.transitLeg) {
      nextLeg = itinerary.legs.find(
        leg => legTime(leg.start) > legTime(currentLeg.start),
      );
      info = <NaviLeg leg={currentLeg} nextLeg={nextLeg} />;
    } else {
      info = `Tracking ${currentLeg?.mode} leg`;
    }
  } else if (time > legTime(last.end)) {
    info = <FormattedMessage id="navigation-journey-end" />;
  } else {
    info = <FormattedMessage id="navigation-wait" />;
  }
  const handleRemove = index => {
    setNotifications(notifications.filter((_, i) => i !== index));
  };

  return (
    <>
      <button type="button" className="navitop" onClick={handleClick}>
        <div className="info">{info}</div>
        <div type="button" className="navitop-arrow">
          {nextLeg && notifications.length > 0 && (
            <Icon
              img="icon-icon_arrow-collapse"
              className={`cursor-pointer ${show ? 'inverted' : ''}`}
              color={config.colors.primary}
            />
          )}
        </div>
      </button>
      {nextLeg && (
        <NaviStack
          notifications={notifications}
          setShow={setShow}
          show={show}
          handleRemove={handleRemove}
        />
      )}
    </>
  );
}

NaviTop.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  time: PropTypes.number.isRequired,
  realTimeLegs: PropTypes.arrayOf(legShape).isRequired,
  /*
  focusToPoint: PropTypes.func.isRequired,
  */
};

NaviTop.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NaviTop;

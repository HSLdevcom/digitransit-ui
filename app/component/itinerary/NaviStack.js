import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import { legShape } from '../../util/shapes';
import { timeStr } from '../../util/timeUtils';
import Icon from '../Icon';
import { legTime } from '../../util/legUtils';

const TRANSFER_SLACK = 60000; // milliseconds

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

const getInfo = (nextLeg, realTimeLegs, intl) => {
  const { start, realTime, to, mode } = nextLeg;
  const { estimatedTime, scheduledTime } = start;
  const { parentStation, name } = to.stop;

  const canceled = realTimeLegs.find(leg => leg.realtimeState === 'CANCELED');
  const transferProblem = findTransferProblem(realTimeLegs);

  const localizedMode = intl.formatMessage({
    id: `${mode.toLowerCase()}`,
    defaultMessage: `${mode}`,
  });

  if (canceled) {
    // Todo: No current design
    return {
      content: <div className="notifiler">Osa matkan lähdöistä on peruttu</div>,
      backgroundColor: '#DC0451',
      iconColor: '#888',
      iconId: 'icon-icon_caution_white_exclamation',
    };
  }

  if (transferProblem !== null) {
    // todo no current design
    return {
      content: (
        <div className="notifiler">{`Vaihto ${transferProblem[0].route.shortName} - ${transferProblem[1].route.shortName} ei onnistu reittisuunnitelman mukaisesti`}</div>
      ),
      iconId: 'icon-icon_caution_white_exclamation',
      iconColor: '#888',
    };
  }
  if (start.estimate?.delay > 0) {
    // Todo: No current design
    return {
      content: <div className="notifiler">Kulkuneuvo on myöhässä</div>,
      backgroundColor: '#FDF3F6',
      iconColor: '#DC0451',
      iconId: 'icon-icon_delay',
    };
  }

  if (!realTime) {
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
};

const NaviStack = ({ realTimeLegs, nextLeg, show }, { intl }) => {
  const info = getInfo(nextLeg, realTimeLegs, intl);

  return (
    <div
      style={{ backgroundColor: info.backgroundColor }}
      className={cx('info-stack', show ? 'slide-in' : 'slide-out')}
    >
      <Icon
        img={info.iconId}
        height={1}
        width={1}
        className="info-icon"
        color={info.iconColor}
      />
      {info.content}
    </div>
  );
};
NaviStack.propTypes = {
  nextLeg: legShape,
  show: PropTypes.bool.isRequired,
  realTimeLegs: PropTypes.arrayOf(legShape).isRequired,
};

NaviStack.defaultProps = {
  nextLeg: null,
};

NaviStack.contextTypes = {
  intl: intlShape.isRequired,
};
export default NaviStack;

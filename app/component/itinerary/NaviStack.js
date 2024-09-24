import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import { legShape } from '../../util/shapes';
import { timeStr } from '../../util/timeUtils';
import Icon from '../Icon';

const getInfo = (nextLeg, canceled, transferProblem, intl) => {
  const { start, realTime, to, mode } = nextLeg;
  const { estimatedTime, scheduledTime } = start;
  const { parentStation, name } = to.stop;

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

const NaviStack = ({ transferProblem, nextLeg, canceled, show }, { intl }) => {
  const info = getInfo(nextLeg, canceled, transferProblem, intl);

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
  transferProblem: PropTypes.arrayOf(legShape),
  nextLeg: legShape,
  canceled: PropTypes.bool,
  show: PropTypes.bool.isRequired,
};

NaviStack.defaultProps = {
  transferProblem: null,
  canceled: false,
  nextLeg: null,
};

NaviStack.contextTypes = {
  intl: intlShape.isRequired,
};
export default NaviStack;

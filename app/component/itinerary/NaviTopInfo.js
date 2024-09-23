import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import { legShape } from '../../util/shapes';
import { timeStr } from '../../util/timeUtils';
import Icon from '../Icon';

const NaviTopInfo = (
  {
    transferProblem,
    nextLeg,
    canceled,
    backgroundColor,
    mode,
    iconColor,
    iconId,
  },
  { intl },
) => {
  let info;
  if (canceled) {
    info = <div className="notifiler">Osa matkan lähdöistä on peruttu</div>;
  } else if (transferProblem !== null) {
    info = (
      <div className="notifiler">{`Vaihto  ${transferProblem[0].route.shortName} - ${transferProblem[1].route.shortName} ei onnistu reittisuunnitelman mukaisesti`}</div>
    );
  } else if (nextLeg) {
    const from = nextLeg.to;
    const stopOrStation = from.stop.parentStation
      ? intl.formatMessage({ id: 'from-station' })
      : intl.formatMessage({ id: 'from-stop' });

    if (nextLeg.start.estimatedTime) {
      info = (
        <div className="card-content">
          <FormattedMessage id="navileg-mode-in-realtime" values={{ mode }} />
          <FormattedMessage
            id="navileg-starts-in-realtime"
            values={{
              time: timeStr(nextLeg.start.estimatedTime),
              stop: stopOrStation,
              stopName: from.stop.name,
            }}
          />
        </div>
      );
    } else {
      info = (
        <div className="card-content">
          <FormattedMessage id="navileg-mode-in-schedule" />
          <FormattedMessage
            id="navileg-starts-in-schedule"
            values={{
              time: timeStr(nextLeg.start.scheduledTime),
              mode,
            }}
          />{' '}
        </div>
      );
    }
  }
  return (
    <div className={cx('navi-top-info')} style={{ backgroundColor }}>
      <Icon
        img={iconId}
        height={1}
        width={1}
        className="info-icon"
        color={iconColor}
      />
      {info}
    </div>
  );
};

NaviTopInfo.propTypes = {
  transferProblem: PropTypes.arrayOf(legShape),
  nextLeg: legShape.isRequired,
  canceled: PropTypes.bool,
  backgroundColor: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired,
  iconId: PropTypes.string.isRequired,
};

NaviTopInfo.defaultProps = {
  transferProblem: null,
  canceled: false,
};

NaviTopInfo.contextTypes = {
  intl: intlShape.isRequired,
};
export default NaviTopInfo;

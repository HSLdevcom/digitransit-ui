import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import { legShape, legTimeShape, stopShape } from '../../util/shapes';
import { timeStr } from '../../util/timeUtils';
import Icon from '../Icon';

const NaviInfo = (
  {
    transferProblem,
    canceled,
    mode,
    iconColor,
    iconId,
    parentStation,
    estimatedTime,
    scheduledTime,
    stopName,
  },
  { intl },
) => {
  let info;
  if (canceled) {
    // todo: no current design
    info = <div className="notifiler">Osa matkan lähdöistä on peruttu</div>;
  } else if (transferProblem !== null) {
    // todo: no current design
    info = (
      <div className="notifiler">{`Vaihto  ${transferProblem[0].route.shortName} - ${transferProblem[1].route.shortName} ei onnistu reittisuunnitelman mukaisesti`}</div>
    );
  } else {
    const stopOrStation = parentStation
      ? intl.formatMessage({ id: 'from-station' })
      : intl.formatMessage({ id: 'from-stop' });

    if (estimatedTime) {
      info = (
        <div className="card-content">
          <FormattedMessage id="navileg-mode-realtime" values={{ mode }} />
          <FormattedMessage
            id="navileg-start-realtime"
            values={{
              time: timeStr(estimatedTime),
              stopOrStation,
              stopName,
            }}
          />
        </div>
      );
    } else {
      info = (
        <div className="card-content">
          <FormattedMessage id="navileg-mode-schedule" />
          <FormattedMessage
            id="navileg-start-schedule"
            values={{
              time: timeStr(scheduledTime),
              mode,
            }}
          />{' '}
        </div>
      );
    }
  }
  return (
    <div className={cx('navi-top-info')}>
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

NaviInfo.propTypes = {
  transferProblem: PropTypes.arrayOf(legShape),
  canceled: PropTypes.bool,
  mode: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired,
  iconId: PropTypes.string.isRequired,
  parentStation: stopShape,
  estimatedTime: legTimeShape,
  scheduledTime: legTimeShape,
  stopName: PropTypes.string,
};

NaviInfo.defaultProps = {
  transferProblem: undefined,
  canceled: false,
  parentStation: undefined,
  stopName: undefined,
  estimatedTime: undefined,
  scheduledTime: undefined,
};

NaviInfo.contextTypes = {
  intl: intlShape.isRequired,
};
export default NaviInfo;

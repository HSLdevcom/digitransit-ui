import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { legTimeStr } from '../../util/legUtils';
import {
  getFirstDepartureStopTypeText,
  getFirstDepartureMessageId,
} from '../../util/localeUtils';
import Icon from '../Icon';
import BoardingInformation from './BoardingInformation';
import { legShape } from '../../util/shapes';

const FirstLegStartTime = ({
  firstDeparture,
  hasCallAgencyLeg,
  breakpoint,
  stopNames,
}) => {
  const intl = useIntl();
  const small = breakpoint !== 'large';

  if (hasCallAgencyLeg) {
    return (
      <div className={cx('itinerary-first-leg-start-time', { small })}>
        <Icon
          img="icon_alert-circle"
          className="itinerary-summary-icon"
          omitViewBox
        />
        <FormattedMessage id="itinerary-summary-row.call-agency-description" />
      </div>
    );
  }

  if (firstDeparture) {
    return (
      <div className={cx('itinerary-first-leg-start-time', { small })}>
        <FormattedMessage
          id={getFirstDepartureMessageId(firstDeparture, false)}
          values={{
            firstDepartureTime: (
              <span
                className={cx('start-time', {
                  realtime: firstDeparture.realTime,
                })}
              >
                {legTimeStr(firstDeparture.start)}
              </span>
            ),
            firstDepartureStopType: getFirstDepartureStopTypeText(
              intl,
              firstDeparture.mode,
            ),
            // In case the first leg is a scooter leg, stopNames[0] is an empty string.
            firstDepartureStop: stopNames[0] || stopNames[1],
            firstDeparturePlatform: (
              <BoardingInformation leg={firstDeparture} />
            ),
          }}
        />
      </div>
    );
  }

  return (
    <div className={cx('itinerary-first-leg-start-time', { small })}>
      <FormattedMessage id="itinerary-summary-row.no-transit-legs" />
    </div>
  );
};

FirstLegStartTime.propTypes = {
  firstDeparture: legShape,
  hasCallAgencyLeg: PropTypes.bool.isRequired,
  breakpoint: PropTypes.string.isRequired,
  stopNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default FirstLegStartTime;

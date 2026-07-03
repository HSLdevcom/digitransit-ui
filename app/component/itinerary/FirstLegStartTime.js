import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { legTimeStr } from '../../util/legUtils';
import {
  BIKEAVL_UNKNOWN,
  getVehicleCapacity,
} from '../../util/vehicleRentalUtils';
import { getFirstDepartureStopTypeText } from '../../util/modeUtils';
import Icon from '../Icon';
import BoardingInformation from './BoardingInformation';
import { useConfigContext } from '../../configurations/ConfigContext';
import { legShape } from '../../util/shapes';

const FirstLegStartTime = ({
  firstDeparture,
  hasCallAgencyLeg,
  breakpoint,
  stopNames,
}) => {
  const intl = useIntl();
  const config = useConfigContext();
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

  if (firstDeparture?.rentedBike) {
    return (
      <div className={cx('itinerary-first-leg-start-time', { small })}>
        <FormattedMessage
          id="itinerary-summary-row.first-leg-start-time-citybike"
          values={{
            firstDepartureTime: (
              <span
                className={cx('time', { realtime: firstDeparture.realTime })}
              >
                {legTimeStr(firstDeparture.start)}
              </span>
            ),
            firstDepartureStop: firstDeparture.from.name,
          }}
        />
        <div>
          {getVehicleCapacity(
            config,
            firstDeparture.from.vehicleRentalStation.rentalNetwork.networkId,
          ) !== BIKEAVL_UNKNOWN && (
            <FormattedMessage
              id="bikes-available"
              values={{
                amount:
                  firstDeparture.from.vehicleRentalStation.availableVehicles
                    .total,
              }}
            />
          )}
        </div>
      </div>
    );
  }

  if (firstDeparture) {
    return (
      <div className={cx('itinerary-first-leg-start-time', { small })}>
        <FormattedMessage
          id="itinerary-summary-row.first-leg-start-time"
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
            // In case the first leg is a scooter leg, stopNames[0] is an empty string
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

FirstLegStartTime.defaultProps = {
  firstDeparture: null,
};

export default FirstLegStartTime;

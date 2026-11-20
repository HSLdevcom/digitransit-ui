import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { durationToString } from '../../../utils/client/timeUtils';

export default function ItineraryTimeSummary({
  startDate,
  hasCallAgencyLeg,
  departureTime,
  arrivalTime,
  duration,
  children,
}) {
  const intl = useIntl();

  return (
    <>
      {startDate && <div className="itinerary-start-date">{startDate}</div>}
      <div className="itinerary-start-time-and-end-time">
        {hasCallAgencyLeg && <FormattedMessage id="estimate" />}{' '}
        {`${departureTime} - ${arrivalTime}`}
      </div>

      <div style={{ flexGrow: 1 }} />
      {children}
      <div className="itinerary-duration">
        {hasCallAgencyLeg && '~'}
        {durationToString(intl, duration)}
      </div>
    </>
  );
}

ItineraryTimeSummary.propTypes = {
  startDate: PropTypes.node,
  hasCallAgencyLeg: PropTypes.bool.isRequired,
  departureTime: PropTypes.string.isRequired,
  arrivalTime: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  children: PropTypes.node,
};

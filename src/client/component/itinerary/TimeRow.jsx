import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { durationToString } from '../../utils/timeUtils';

export default function TimeRow({
  startDate,
  hasCallAgencyLeg,
  departureTime,
  arrivalTime,
  duration,
  children,
}) {
  const intl = useIntl();

  return (
    <div className="itinerary-row-time" aria-hidden="true">
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
    </div>
  );
}

TimeRow.propTypes = {
  startDate: PropTypes.node,
  hasCallAgencyLeg: PropTypes.bool.isRequired,
  departureTime: PropTypes.string.isRequired,
  arrivalTime: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  children: PropTypes.node,
};

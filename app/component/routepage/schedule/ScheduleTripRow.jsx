/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import cx from 'classnames';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import Icon from '@digitransit-component/digitransit-component-icon';

/**
 * Presents a single departure/arrival row with optional cancel styling.
 */
export default function ScheduleTripRow({ departureTime, arrivalTime, isCanceled = false }) {
  const intl = useIntl();
  return (
    <div className="trip-column" role="listitem" tabIndex={0}>
      <span className="sr-only">
        {intl.formatMessage(
          { id: 'route-page.trip-sr' },
          { departure: departureTime, arrival: arrivalTime },
        )}
        {isCanceled && `, ${intl.formatMessage({ id: 'canceled' })}`}
      </span>
      <div aria-hidden="true" className={cx('trip-from', 'trip-label', { canceled: isCanceled })}>
        {departureTime}
      </div>
      <div className="trip-separator" aria-hidden="true">
        <Icon img="arrow" color="#888888" />
      </div>
      <div aria-hidden="true" className={cx('trip-to', 'trip-label', { canceled: isCanceled })}>
        {arrivalTime}
      </div>
    </div>
  );
}
ScheduleTripRow.propTypes = {
  departureTime: PropTypes.string.isRequired,
  arrivalTime: PropTypes.string.isRequired,
  isCanceled: PropTypes.bool,
};

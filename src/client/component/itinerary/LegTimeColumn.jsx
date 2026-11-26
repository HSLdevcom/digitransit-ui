import cx from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Text } from '@hsl-fi/layout-primitives';

/**
 * Time column of a leg row. Giving the estimate prop (true or false) anchors an optional
 * estimate label to the time and highlights realtime times.
 */
export default function LegTimeColumn({ time, estimate, realTime = false, children }) {
  const showEstimate = !!estimate;
  return (
    <div
      className={cx('small-2', 'columns', 'itinerary-time-column', {
        'has-estimate': showEstimate,
      })}
      aria-hidden="true"
    >
      {estimate === undefined ? (
        <div className="itinerary-time-column-time">{time}</div>
      ) : (
        <div className="itinerary-time-column-time-group">
          <div className="itinerary-time-column-time">
            <span className={cx({ realtime: realTime })}>{time}</span>
          </div>
          {showEstimate && (
            <Text
              as="span"
              variant="routes-xxs"
              color="weak"
              className="itinerary-time-column-estimate"
            >
              <FormattedMessage id="estimate" />
            </Text>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

LegTimeColumn.propTypes = {
  time: PropTypes.string.isRequired,
  estimate: PropTypes.bool,
  realTime: PropTypes.bool,
  children: PropTypes.node,
};

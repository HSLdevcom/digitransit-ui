import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { AlertSeverityLevelType } from '../../../shared/utils/constants';

const descriptionIds = {
  [AlertSeverityLevelType.Info]: 'itinerary-details.route-has-info-alert',
  [AlertSeverityLevelType.Warning]: 'itinerary-details.route-has-warning-alert',
  [AlertSeverityLevelType.Severe]: 'itinerary-details.route-has-severe-alert',
};

/**
 * Screen reader text telling the highest alert severity of a leg.
 */
export default function AlertSeverityDescription({ severityLevel }) {
  return (
    <span className="sr-only">
      {severityLevel && (
        <FormattedMessage
          id={descriptionIds[severityLevel] || 'itinerary-details.route-has-unknown-alert'}
        />
      )}
    </span>
  );
}

AlertSeverityDescription.propTypes = { severityLevel: PropTypes.string };

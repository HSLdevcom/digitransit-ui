import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { AlertSeverityLevelType } from '../constants';
import ServiceAlertIcon from './ServiceAlertIcon';

export default function ItineraryListHeader({
  translationId,
  defaultMessage,
  showCostInfo,
}) {
  return (
    <div className="itinerary-summary-subtitle-container">
      <FormattedMessage id={translationId} defaultMessage={defaultMessage} />
      {showCostInfo && (
        <div className="with-bike-info">
          <div className="with-bike-icon notification-icon">
            <ServiceAlertIcon
              className="inline-icon"
              color="#007AC9"
              severityLevel={AlertSeverityLevelType.Info}
            />
          </div>
          <div className="with-bike-info-notification">
            <div className="with-bike-info-content">
              <FormattedMessage
                id="itinerary-summary.costinformation"
                defaultMessage="Invalid cost information: translation not found"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ItineraryListHeader.propTypes = {
  translationId: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string,
  showCostInfo: PropTypes.bool,
};

ItineraryListHeader.defaultProps = {
  defaultMessage: '',
  showCostInfo: false,
};

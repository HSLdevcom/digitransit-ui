import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { AlertSeverityLevelType } from '../../constants';
import ServiceAlertIcon from '../ServiceAlertIcon';

export default function ItineraryListHeader({
  translationId,
  defaultMessage,
  showBikeBoardingInfo,
}) {
  return (
    <div className="itinerary-summary-subtitle-container">
      <FormattedMessage id={translationId} defaultMessage={defaultMessage} />
      {showBikeBoardingInfo && (
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
                id="itinerary-summary.bike-boarding-information"
                defaultMessage="Invalid boarding information: translation not found"
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
  showBikeBoardingInfo: PropTypes.bool,
};

ItineraryListHeader.defaultProps = {
  defaultMessage: '',
  showBikeBoardingInfo: false,
};

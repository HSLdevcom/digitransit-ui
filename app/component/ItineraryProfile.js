import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import { displayDistance } from '../util/geo-utils';
import { getTotalDistance } from '../util/legUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import SecondaryButton from './SecondaryButton';

const printItinerary = e => {
  e.stopPropagation();
  addAnalyticsEvent({
    event: 'sendMatomoEvent',
    category: 'Itinerary',
    action: 'Print',
    name: null,
  });
  window.print();
};

const ItineraryProfile = ({ itinerary, small }, { config, intl }) => {
  return (
    <div className={cx('itinerary-profile-container', { small })}>
      <div className="itinerary-profile-item">
        <div className="itinerary-profile-item-title">
          {`${intl.formatMessage({
            id: 'distance-total',
            defaultMessage: 'Distance',
          })}:`}
        </div>
        <div className="itinerary-profile-item-value">
          {displayDistance(
            getTotalDistance(itinerary),
            config,
            intl.formatNumber,
          )}
        </div>
      </div>
      {printItinerary && (
        <SecondaryButton
          ariaLabel="print"
          buttonName="print"
          buttonClickAction={printItinerary}
          buttonIcon="icon-icon_print"
          smallSize
        />
      )}
    </div>
  );
};

ItineraryProfile.propTypes = {
  itinerary: PropTypes.shape({
    legs: PropTypes.arrayOf(
      PropTypes.shape({
        distance: PropTypes.number,
      }),
    ).isRequired,
  }).isRequired,
  small: PropTypes.bool,
};

ItineraryProfile.defaultProps = {
  small: false,
};

ItineraryProfile.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default ItineraryProfile;

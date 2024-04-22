import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { configShape, itineraryShape } from '../../util/shapes';
import { displayDistance } from '../../util/geo-utils';
import { getTotalDistance } from '../../util/legUtils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import SecondaryButton from '../SecondaryButton';

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

export default function Profile({ itinerary, small }, { config, intl }) {
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
}

Profile.propTypes = {
  itinerary: itineraryShape.isRequired,
  small: PropTypes.bool,
};

Profile.defaultProps = {
  small: false,
};

Profile.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

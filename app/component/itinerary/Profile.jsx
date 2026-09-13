import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import { itineraryShape } from '../../util/shapes.js';
import { useConfigContext } from '../../configurations/ConfigContext.jsx';
import { displayDistance } from '../../util/geo-utils.js';
import { getTotalDistance } from '../../util/legUtils.js';
import { addAnalyticsEvent } from '../../util/analyticsUtils.js';
import SecondaryButton from '../SecondaryButton.jsx';

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

export default function Profile({ itinerary, small = false }) {
  const intl = useIntl();
  const config = useConfigContext();
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
          buttonIcon="icon_print"
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

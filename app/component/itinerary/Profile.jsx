import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import { itineraryShape } from '../../../utils/client/shapes';
import { useConfigContext } from '../../client/ConfigContext';
import { displayDistance } from '../../../utils/shared/geo-utils';
import { getTotalDistance } from '../../../utils/client/legUtils';
import { addAnalyticsEvent } from '../../../utils/shared/analyticsUtils';
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

import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import { displayDistance } from '../util/geo-utils';
import { getTotalDistance } from '../util/legUtils';
import SecondaryButton from './SecondaryButton';
import withBreakpoint from '../util/withBreakpoint';

const ItineraryProfile = (
  { itinerary, small, printItinerary, breakpoint },
  { config, intl },
) => {
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
      {breakpoint === 'large' && printItinerary && (
        <SecondaryButton
          ariaLabel="print"
          buttonName="print"
          buttonClickAction={e => {
            printItinerary(e);
            // addAnalyticsEvent({
            // category: 'Stop',
            // action: 'PrintTimetable',
            // name: null,
            // });
          }}
          buttonIcon="icon-icon_print"
          smallSize
        />
      )}
    </div>
  );
};

ItineraryProfile.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  itinerary: PropTypes.shape({
    legs: PropTypes.arrayOf(
      PropTypes.shape({
        distance: PropTypes.number,
      }),
    ).isRequired,
  }).isRequired,
  small: PropTypes.bool,
  printItinerary: PropTypes.func,
};

ItineraryProfile.defaultProps = {
  small: false,
  printItinerary: undefined,
};

ItineraryProfile.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

const componentWithBreakpoint = withBreakpoint(ItineraryProfile);

export default componentWithBreakpoint;

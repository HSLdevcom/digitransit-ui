import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { withLeaflet } from 'react-leaflet/es/context';
import { locationShape } from '../../../utils/client/shapes';
import { addAnalyticsEvent } from '../../../utils/shared/analyticsUtils';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function MarkerPopupBottom({
  location,
  leaflet,
  onSelectLocation,
  locationPopup = 'all', // show add via point by default
}) {
  const routeFrom = () => {
    addAnalyticsEvent({
      action: 'EditJourneyStartPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    onSelectLocation(location, 'origin');
    leaflet.map.closePopup();
  };

  const routeTo = () => {
    addAnalyticsEvent({
      action: 'EditJourneyEndPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    onSelectLocation(location, 'destination');
    leaflet.map.closePopup();
  };

  const routeAddViaPoint = () => {
    addAnalyticsEvent({
      action: 'AddJourneyViaPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    onSelectLocation(location, 'via');
    leaflet.map.closePopup();
  };

  return (
    <div className="bottom location">
      <div onClick={() => routeFrom()} className="route cursor-pointer">
        <FormattedMessage
          id="route-from-here"
          defaultMessage="Route from here"
        />
      </div>
      {locationPopup === 'all' && (
        <div
          onClick={() => routeAddViaPoint()}
          className="route cursor-pointer route-add-viapoint"
        >
          <FormattedMessage
            id="route-add-viapoint"
            defaultMessage="Via point"
          />
        </div>
      )}
      <div onClick={() => routeTo()} className="route cursor-pointer">
        <FormattedMessage id="route-here" defaultMessage="Route here" />
      </div>
    </div>
  );
}

MarkerPopupBottom.displayName = 'MarkerPopupBottom';

MarkerPopupBottom.propTypes = {
  location: locationShape.isRequired,
  leaflet: PropTypes.shape({
    map: PropTypes.shape({
      closePopup: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  onSelectLocation: PropTypes.func.isRequired,
  locationPopup: PropTypes.string,
};

const markerPopupBottomWithLeaflet = withLeaflet(MarkerPopupBottom);

export {
  markerPopupBottomWithLeaflet as default,
  MarkerPopupBottom as Component,
};

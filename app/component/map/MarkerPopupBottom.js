import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/get';
import { routerShape, locationShape } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { withLeaflet } from 'react-leaflet/es/context';
import updateViaPointsFromMap from '../../action/ViaPointsActions';
import { withCurrentTime } from '../../util/searchUtils';
import {
  PREFIX_ROUTES,
  PREFIX_STOPS,
  PREFIX_ITINERARY_SUMMARY,
  parseLocation,
  navigateTo,
} from '../../util/path';
import {
  getIntermediatePlaces,
  setIntermediatePlaces,
} from '../../util/queryUtils';
import { dtLocationShape } from '../../util/shapes';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const locationToOtp = location =>
  `${location.address}::${location.lat},${location.lon}${
    location.locationSlack ? `::${location.locationSlack}` : ''
  }`;

class MarkerPopupBottom extends React.Component {
  static displayName = 'MarkerPopupBottom';

  static propTypes = {
    location: dtLocationShape.isRequired,
    leaflet: PropTypes.shape({
      map: PropTypes.shape({
        closePopup: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static contextTypes = {
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func,
  };

  getOrigin = (pathName, context) => {
    let origin;

    if ([PREFIX_ROUTES, PREFIX_STOPS].indexOf(context) !== -1) {
      origin = { set: false };
    } else if (context === PREFIX_ITINERARY_SUMMARY) {
      // itinerary summary
      const [, , originString] = pathName.split('/');
      origin = parseLocation(originString);
    } else {
      // index
      const [, originString] = pathName.split('/');
      origin = parseLocation(originString);
    }
    return origin;
  };

  getDestination = (pathName, context) => {
    let destination;

    if ([PREFIX_ROUTES, PREFIX_STOPS].indexOf(context) !== -1) {
      destination = { set: false };
    } else if (context === PREFIX_ITINERARY_SUMMARY) {
      // itinerary summary
      const [, , , destinationString] = pathName.split('/');
      destination = parseLocation(destinationString);
    } else {
      // index
      const [, , destinationString] = pathName.split('/');
      destination = parseLocation(destinationString);
    }
    return destination;
  };

  routeFrom = () => {
    addAnalyticsEvent({
      action: 'EditJourneyStartPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    const locationWithTime = withCurrentTime(
      this.context.getStore,
      this.context.location,
    );

    const pathName = get(this.context, 'location.pathname');
    const [, context] = pathName.split('/');

    const destination = this.getDestination(pathName, context);

    this.props.leaflet.map.closePopup();
    navigateTo({
      origin: { ...this.props.location, ready: true },
      destination,
      context,
      router: this.context.router,
      base: locationWithTime,
      resetIndex: true,
    });
  };

  routeTo = () => {
    addAnalyticsEvent({
      action: 'EditJourneyEndPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    const locationWithTime = withCurrentTime(
      this.context.getStore,
      this.context.location,
    );

    const pathName = get(this.context, 'location.pathname');
    const [, context] = pathName.split('/');

    const origin = this.getOrigin(pathName, context);

    this.props.leaflet.map.closePopup();
    navigateTo({
      origin,
      destination: { ...this.props.location, ready: true },
      context,
      router: this.context.router,
      base: locationWithTime,
      resetIndex: true,
    });
  };

  routeAddViaPoint = () => {
    addAnalyticsEvent({
      action: 'AddJourneyViaPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    const viaPoints = getIntermediatePlaces(this.context.location.query)
      .concat([this.props.location])
      .map(locationToOtp);
    this.props.leaflet.map.closePopup();

    setIntermediatePlaces(this.context.router, viaPoints);
    this.context.executeAction(updateViaPointsFromMap, true);
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    return (
      <div className="bottom location">
        <div onClick={() => this.routeFrom()} className="route cursor-pointer">
          <FormattedMessage
            id="route-from-here"
            defaultMessage="Route from here"
          />
        </div>
        {this.context.location.pathname.startsWith(
          `/${PREFIX_ITINERARY_SUMMARY}/`,
        ) &&
          getIntermediatePlaces(this.context.location.query).length < 5 && (
            <div
              onClick={() => this.routeAddViaPoint()}
              className="route cursor-pointer route-add-viapoint"
            >
              <FormattedMessage
                id="route-add-viapoint"
                defaultMessage="Via point"
              />
            </div>
          )}
        <div onClick={() => this.routeTo()} className="route cursor-pointer">
          <FormattedMessage id="route-here" defaultMessage="Route here" />
        </div>
      </div>
    );
  }
}

const markerPopupBottomWithLeaflet = withLeaflet(MarkerPopupBottom);

export {
  markerPopupBottomWithLeaflet as default,
  MarkerPopupBottom as Component,
};

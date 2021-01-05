import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import { withLeaflet } from 'react-leaflet/es/context';
import { addViaPoint } from '../../action/ViaPointActions';
import { PREFIX_ITINERARY_SUMMARY, parseLocation } from '../../util/path';
import { getIntermediatePlaces } from '../../util/otpStrings';
import {
  setIntermediatePlaces,
  updateItinerarySearch,
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
    match: matchShape.isRequired,
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func,
    config: PropTypes.object.isRequired,
  };

  getOrigin = () => {
    const { pathname } = this.context.match.location;
    const [, rootPath] = pathname.split('/');
    let origin = {};

    if (
      rootPath === PREFIX_ITINERARY_SUMMARY ||
      (rootPath === this.context.config.indexPath &&
        this.context.config.indexPath !== '')
    ) {
      // itinerary summary or index with custom indexPath
      const [, , originString] = pathname.split('/');
      origin = parseLocation(originString);
    } else {
      // index
      const [, originString] = pathname.split('/');
      origin = parseLocation(originString);
    }
    return origin;
  };

  getDestination = () => {
    const { pathname } = this.context.match.location;
    const [, rootPath] = pathname.split('/');

    let destination = {};
    if (
      rootPath === PREFIX_ITINERARY_SUMMARY ||
      (rootPath === this.context.config.indexPath &&
        this.context.config.indexPath !== '')
    ) {
      // itinerary summary or index with custom indexPath
      const [, , , destinationString] = pathname.split('/');
      destination = parseLocation(destinationString);
    } else {
      // index
      const [, , destinationString] = pathname.split('/');
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

    updateItinerarySearch(
      this.props.location,
      this.getDestination(),
      this.context.match.location,
      this.context.executeAction,
      this.context.router,
    );
    this.props.leaflet.map.closePopup();
  };

  routeTo = () => {
    addAnalyticsEvent({
      action: 'EditJourneyEndPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });

    updateItinerarySearch(
      this.getOrigin(),
      this.props.location,
      this.context.match.location,
      this.context.executeAction,
      this.context.router,
    );
    this.props.leaflet.map.closePopup();
  };

  routeAddViaPoint = () => {
    addAnalyticsEvent({
      action: 'AddJourneyViaPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    const viaPoints = getIntermediatePlaces(this.context.match.location.query)
      .concat([this.props.location])
      .map(locationToOtp);
    this.props.leaflet.map.closePopup();
    setIntermediatePlaces(this.context.router, this.context.match, viaPoints);
    this.context.executeAction(addViaPoint, this.props.location);
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
        {this.context.match.location.pathname.startsWith(
          `/${PREFIX_ITINERARY_SUMMARY}/`,
        ) &&
          getIntermediatePlaces(this.context.match.location.query).length <
            5 && (
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

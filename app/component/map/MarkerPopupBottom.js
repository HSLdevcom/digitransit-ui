import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/get';
import { routerShape, locationShape } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { withLeaflet } from 'react-leaflet/es/context';

import {
  PREFIX_ROUTES,
  PREFIX_STOPS,
  PREFIX_ITINERARY_SUMMARY,
  parseLocation,
  navigateTo,
} from '../../util/path';
import { withCurrentTime } from '../../util/searchUtils';
import { dtLocationShape } from '../../util/shapes';

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
  };

  routeFrom = () => {
    const locationWithTime = withCurrentTime(
      this.context.getStore,
      this.context.location,
    );

    let destination;

    const pathName = get(this.context, 'location.pathname');
    const [, context] = pathName.split('/');

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
    const locationWithTime = withCurrentTime(
      this.context.getStore,
      this.context.location,
    );

    let origin;

    const pathName = get(this.context, 'location.pathname');
    const [, context] = pathName.split('/');

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
        <div onClick={() => this.routeTo()} className="route cursor-pointer">
          <FormattedMessage id="route-here" defaultMessage="Route here" />
        </div>
      </div>
    );
  }
}

export default withLeaflet(MarkerPopupBottom);

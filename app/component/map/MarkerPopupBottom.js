import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/get';
import { routerShape, locationShape } from 'react-router';
import { FormattedMessage } from 'react-intl';

import {
  TAB_NEARBY,
  getPathWithEndpointObjects,
  isItinerarySearchObjects,
  parseLocation,
} from '../../util/path';
import { withCurrentTime } from '../../util/searchUtils';
import { dtLocationShape } from '../../util/shapes';

class MarkerPopupBottom extends React.Component {
  static displayName = 'MarkerPopupBottom';

  static propTypes = {
    location: dtLocationShape.isRequired,
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

    if (
      !pathName ||
      pathName.startsWith('/pysakit') ||
      pathName.startsWith('/linjat')
    ) {
      destination = { set: false };
    } else {
      const [, , destinationString] = pathName.split('/');
      destination = parseLocation(destinationString);
    }

    locationWithTime.pathname = getPathWithEndpointObjects(
      this.props.location,
      destination,
      TAB_NEARBY,
    );

    this.navigate(
      locationWithTime,
      !isItinerarySearchObjects(this.props.location, destination),
    );
  };

  routeTo = () => {
    const locationWithTime = withCurrentTime(
      this.context.getStore,
      this.context.location,
    );

    let origin;

    const pathName = get(this.context, 'location.pathname');

    if (
      !pathName ||
      pathName.startsWith('/pysakit') ||
      pathName.startsWith('/linjat')
    ) {
      origin = { set: false };
    } else {
      const [, originString] = pathName.split('/');
      origin = parseLocation(originString);
    }

    locationWithTime.pathname = getPathWithEndpointObjects(
      origin,
      this.props.location,
      TAB_NEARBY,
    );

    this.navigate(
      locationWithTime,
      !isItinerarySearchObjects(origin, this.props.location),
    );
  };

  navigate = (url, replace) => {
    if (replace) {
      this.context.router.replace(url);
    } else {
      this.context.router.push(url);
    }
  };

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

export default MarkerPopupBottom;

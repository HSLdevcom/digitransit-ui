import PropTypes from 'prop-types';
import React from 'react';
import { routerShape, locationShape } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { getPathWithEndpoints, isItinerarySearch } from '../../util/path';
import { withCurrentTime } from '../../util/searchUtils';
import { locationToOTP } from '../../util/otpStrings';

class MarkerPopupBottom extends React.Component {
  static displayName = 'MarkerPopupBottom';

  static propTypes = {
    location: PropTypes.object.isRequired,
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

    // todo restore time

    let [
      ,
      originString,
      destinationString,
    ] = this.context.location.pathname.split('/');

    originString = locationToOTP(this.props.location);
    const url = getPathWithEndpoints(originString, destinationString);
    this.navigate(url, !isItinerarySearch(originString, destinationString));
  };

  routeTo = () => {
    const locationWithTime = withCurrentTime(
      this.context.getStore,
      this.context.location,
    );

    // todo restore time

    let [
      ,
      originString,
      destinationString,
    ] = this.context.location.pathname.split('/');

    if (
      originString === undefined ||
      originString === null ||
      originString.trim() === ''
    ) {
      originString = undefined;
    }

    console.log('routing to and origin=', originString);
    destinationString = locationToOTP(this.props.location);
    const url = getPathWithEndpoints(originString, destinationString);
    this.navigate(url, !isItinerarySearch(originString, destinationString));
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

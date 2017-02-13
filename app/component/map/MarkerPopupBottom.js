import React from 'react';
import { routerShape, locationShape } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { setEndpoint } from '../../action/EndpointActions';

class MarkerPopupBottom extends React.Component {
  static displayName = 'MarkerPopupBottom';

  static propTypes = {
    location: React.PropTypes.object.isRequired,
  };

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    getStore: React.PropTypes.func.isRequired,
  };

  routeFrom = () => {
    const time = this.context.getStore('TimeStore').getCurrentTime().unix();
    const locationWithTime = {
      ...this.context.location,
      query: {
        time,
      },
    };

    this.context.executeAction(setEndpoint, {
      target: 'origin',
      endpoint: this.props.location,
      router: this.context.router,
      location: locationWithTime,
    });
  }

  routeTo = () => {
    const time = this.context.getStore('TimeStore').getCurrentTime().unix();
    const locationWithTime = {
      ...this.context.location,
      query: {
        time,
      },
    };

    this.context.executeAction(setEndpoint, {
      target: 'destination',
      endpoint: this.props.location,
      router: this.context.router,
      location: locationWithTime,
    });
  }

  render() {
    return (
      <div className="bottom location">
        <div onClick={() => this.routeFrom()} className="route cursor-pointer">
          <FormattedMessage id="route-from-here" defaultMessage="Route from here" />
        </div>
        <div onClick={() => this.routeTo()} className="route cursor-pointer">
          <FormattedMessage id="route-here" defaultMessage="Route here" />
        </div>
      </div>);
  }
}

export default MarkerPopupBottom;

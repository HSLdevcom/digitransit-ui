import React from 'react';
import { FormattedMessage } from 'react-intl';
import { setEndpoint } from '../../action/EndpointActions';

class MarkerPopupBottom extends React.Component {
  static displayName = 'MarkerPopupBottom';

  static propTypes = {
    location: React.PropTypes.object.isRequired,
  };

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  routeFrom = () => {
    this.context.executeAction(setEndpoint, {
      target: 'origin',
      endpoint: this.props.location,
      router: this.context.router,
      location: this.context.location,
    });
  }

  routeTo = () =>
    this.context.executeAction(setEndpoint, {
      target: 'destination',
      endpoint: this.props.location,
      router: this.context.router,
      location: this.context.location,
    });

  render() {
    return (
      <div className="bottom location">
        <div onClick={() => this.routeFrom()} className="route cursor-pointer">
          <FormattedMessage id="route-from-here" defaultMessage="Route from here" />
        </div>
        <div onClick={() => this.routeTo()} className="route cursor-pointer">
          <FormattedMessage id="route-here" defaultMessage="Route to here" />
        </div>
      </div>);
  }
}

export default MarkerPopupBottom;

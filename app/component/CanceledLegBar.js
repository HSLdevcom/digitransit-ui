import React from 'react';
import PropTypes from 'prop-types';
import { routerShape } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { replaceQueryParams } from '../util/queryUtils';

class CanceledLegBar extends React.Component {
  static contextTypes = {
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
  };

  state = {
    showBanner: false,
  };

  componentDidMount() {
    window.addEventListener(
      'showCanceledLegsBanner',
      this.handleCanceledLegBar,
      false,
    );
  }
  componentWillUnmount() {
    window.removeEventListener(
      'showCanceledLegsBanner',
      this.handleCanceledLegBar,
    );
  }
  handleCanceledLegBar = event => {
    if (event.detail.canceledLegs) {
      this.setState({
        showBanner: true,
      });
    } else {
      this.setState({
        showBanner: false,
      });
    }
  };

  fetchNewRoute = () => {
    replaceQueryParams(this.context.router, this.context.location.query);
  };

  render() {
    return (
      <div
        className="canceled-legs-banner"
        style={{ display: this.state.showBanner ? 'block' : 'none' }}
      >
        <div className="canceled-legs-container">
          <div className="canceled-legs-icon">
            <Icon img="icon-icon_caution" />
          </div>
          <div className="canceled-legs-right-content">
            <div className="canceled-legs-text">
              <FormattedMessage
                id="canceled-legs"
                defaultMessage="Canceled departures on the route"
              />
            </div>
            <div className="canceled-legs-get-new-route">
              <button
                onClick={e => {
                  e.stopPropagation();
                  this.fetchNewRoute();
                }}
              >
                <FormattedMessage
                  id="fetch-new-route"
                  defaultMessage="Fetch a new route"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CanceledLegBar;

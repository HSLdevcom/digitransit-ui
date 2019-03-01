import React from 'react';
import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { replaceQueryParams } from '../util/queryUtils';
import ComponentUsageExample from './ComponentUsageExample';

class CanceledLegsBar extends React.Component {
  static contextTypes = {
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
  };

  static propTypes = {
    showCanceledLegsBanner: PropTypes.bool,
  };

  static defaultProps = {
    showCanceledLegsBanner: false,
  };

  fetchNewRoute = () => {
    replaceQueryParams(this.context.router, this.context.location.query);
  };

  render() {
    return (
      <div
        className="canceled-legs-banner"
        style={{
          display: this.props.showCanceledLegsBanner ? 'block' : 'none',
        }}
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
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  this.fetchNewRoute();
                }}
                className="button-get-new-route"
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

const withStore = connectToStores(
  CanceledLegsBar,
  ['CanceledLegsBarStore'],
  context => ({
    showCanceledLegsBanner: context
      .getStore('CanceledLegsBarStore')
      .getShowCanceledLegsBanner(),
  }),
);

CanceledLegsBar.description = () => (
  <div>
    <p>Canceled legs banner.</p>
    <ComponentUsageExample description="Informs the user about canceled legs on the suggested itinerary.">
      <CanceledLegsBar showCanceledLegsBanner />
    </ComponentUsageExample>
  </div>
);

export { withStore as default, CanceledLegsBar as component };

import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import { FormattedMessage } from 'react-intl';
import CityBikeStopContent from './CityBikeStopContent';
import BikeRentalStationHeader from './BikeRentalStationHeader';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';

class BikeRentalStationContent extends React.Component {
  static PropTypes = {
    bikeRentalStation: PropTypes.any,
  };

  render() {
    const { bikeRentalStation } = this.props;
    return (
      <div className="bike-station-page-container">
        <BikeRentalStationHeader
          bikeRentalStation={bikeRentalStation}
          breakpoint={this.props.breakpoint}
        />
        <CityBikeStopContent bikeRentalStation={bikeRentalStation} />
        <div className="citybike-use-disclaimer">
          <div className="disclaimer-header">
            <FormattedMessage id="citybike-start-using" />
          </div>
          <div className="disclaimer-content">
            <FormattedMessage id="citybike-buy-season" />
          </div>
          <a
            onClick={e => {
              e.stopPropagation();
            }}
            className="external-link"
            href="href"
          >
            <FormattedMessage id="citybike-purchase-link" />
            <Icon img="icon-icon_external-link-box" />
          </a>
        </div>
      </div>
    );
  }
}
const BikeRentalStationContentWithBreakpoint = withBreakpoint(
  BikeRentalStationContent,
);

const containerComponent = createFragmentContainer(
  BikeRentalStationContentWithBreakpoint,
  {
    bikeRentalStation: graphql`
      fragment BikeRentalStationContent_bikeRentalStation on BikeRentalStation {
        lat
        lon
        name
        spacesAvailable
        bikesAvailable
        networks
        stationId
      }
    `,
  },
);

export {
  containerComponent as default,
  BikeRentalStationContentWithBreakpoint as Component,
};

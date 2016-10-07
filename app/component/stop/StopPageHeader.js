import React from 'react';
import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';

import StopCardHeader from '../stop-cards/StopCardHeader';
import { addFavouriteStop } from '../../action/FavouriteActions';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

const PureStopPageHeader = compose(
  getContext({ executeAction: React.PropTypes.func.isRequired }),
  mapProps((props) => ({
    stop: props.stop,
    favourite: props.favourite,
    infoIcon: !!props.params.stopId,
    className: 'stop-page header',
    headingStyle: 'h3',
    addFavouriteStop: !(props.params.stopId) ? false : e => {
      e.stopPropagation();
      props.executeAction(addFavouriteStop, props.params.stopId);
    },
  }))
)(StopCardHeader);

const exampleStop = {
  code: '4611',
  gtfsId: 'HSL:1541157',
  name: 'Kaivonkatsojanpuisto',
  desc: 'Kaivonkatsojantie',
};

PureStopPageHeader.description = (
  <div>
    <ComponentUsageExample description="basic">
      <PureStopPageHeader stop={exampleStop} params={{ stopId: 123 }} />
    </ComponentUsageExample>
  </div>
);

const StopPageHeaderContainer = Relay.createContainer(PureStopPageHeader, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        ${StopCardHeader.getFragment('stop')}
      }
    `,
  },
});

export { PureStopPageHeader };

export default connectToStores(StopPageHeaderContainer, ['FavouriteStopsStore'],
  ({ getStore }, { params }) => ({
    favourite: getStore('FavouriteStopsStore').isFavourite(params.stopId),
  })
);

import React from 'react';
import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';

import StopCardHeader from '../stop-cards/StopCardHeader';
import { addFavouriteStop } from '../../action/FavouriteActions';

const StopPageHeader = compose(
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

const StopPageHeaderContainer = Relay.createContainer(StopPageHeader, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        ${StopCardHeader.getFragment('stop')}
      }
    `,
  },
});

export default connectToStores(StopPageHeaderContainer, ['FavouriteStopsStore'],
  ({ getStore }, { params }) => ({
    favourite: getStore('FavouriteStopsStore').isFavourite(params.stopId),
  })
);

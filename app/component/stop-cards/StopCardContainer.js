import React from 'react';
import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import StopCardHeader from './StopCardHeader';
import DepartureListContainer from '../departure/DepartureListContainer';
import StopCard from './stop-card';
import { addFavouriteStop } from '../../action/FavouriteActions';

const StopCardContainer = connectToStores(StopCard, ['FavouriteStopsStore'], (context, props) =>
  ({
    favourite: context.getStore('FavouriteStopsStore').isFavourite(props.stop.gtfsId),
    addFavouriteStop(e) {
      e.preventDefault();
      return context.executeAction(addFavouriteStop, props.stop.gtfsId);
    },
    children: <DepartureListContainer
      rowClasses="no-padding no-margin"
      stoptimes={props.stop.stoptimes}
      limit={props.departures}
    />,
  })
);

StopCardContainer.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
  getStore: React.PropTypes.func.isRequired,
};

export default Relay.createContainer(StopCardContainer, {
  fragments:
  {
    stop: () => Relay.QL`
      fragment on Stop{
        gtfsId
        stoptimes: stoptimesForServiceDate(date: $date) {
          ${DepartureListContainer.getFragment('stoptimes')}
        }
        ${StopCardHeader.getFragment('stop')}
      }
    `,
  },
  initialVariables: {
    date: null,
  },
});

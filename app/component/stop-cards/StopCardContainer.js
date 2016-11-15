import React from 'react';
import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import StopCardHeaderContainer from './StopCardHeaderContainer';
import DepartureListContainer from '../departure/DepartureListContainer';
import StopCard from './StopCard';
import { addFavouriteStop } from '../../action/FavouriteActions';
import Favourite from '../favourites/Favourite';

const StopCardContainer = connectToStores(StopCard, ['FavouriteStopsStore'], (context, props) =>
  ({
    icons: [
      props.isTerminal ? null :
      <Favourite
        favourite={context.getStore('FavouriteStopsStore').isFavourite(props.stop.gtfsId)}
        addFavourite={(e) => {
          e.preventDefault();
          return context.executeAction(addFavouriteStop, props.stop.gtfsId);
        }}
      />,
    ],
    isTerminal: props.isTerminal,
    children: <DepartureListContainer
      rowClasses="no-padding no-margin"
      stoptimes={props.stop.stoptimes}
      limit={props.departures}
      isTerminal={props.isTerminal}
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
        ${StopCardHeaderContainer.getFragment('stop')}
      }
    `,
  },
  initialVariables: {
    date: null,
  },
});

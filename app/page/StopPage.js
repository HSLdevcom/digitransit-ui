import React from 'react';
import Relay from 'react-relay';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';
import some from 'lodash/some';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';

import DepartureListHeader from '../component/departure/DepartureListHeader';
import DepartureListContainer from '../component/departure/DepartureListContainer';

const DepartureListContainerComposed = compose(
  getContext({ breakpoint: React.PropTypes.string.isRequired }),
  mapProps(props => (some(props.routes, 'fullscreenMap') && props.breakpoint !== 'large' ? null : {
    stoptimes: props.stop.stoptimes,
    key: 'departures',
    className: 'stop-page momentum-scroll',
    routeLinks: true,
    infiniteScroll: true,
    isTerminal: !(props.params.stopId),
    rowClasses: 'padding-normal border-bottom',
  }))
)(DepartureListContainer);

const StopPage = (props) => (
  <div>
    <DepartureListHeader />
    <DepartureListContainerComposed {...props} />
  </div>
);

const StopPageContainer = Relay.createContainer(StopPage, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        stoptimes: stoptimesForServiceDate(date: $date) {
          ${DepartureListContainer.getFragment('stoptimes')}
        }
      }
    `,
  },

  initialVariables: {
    date: moment().format('YYYYMMDD'),
  },
});

export default connectToStores(StopPageContainer, ['TimeStore', 'FavouriteStopsStore'],
  ({ getStore }) => ({
    date: getStore('TimeStore').getCurrentTime().format('YYYYMMDD'),
  }));

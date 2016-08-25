import React from 'react';
import Relay from 'react-relay';
import Helmet from 'react-helmet';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Link from 'react-router/lib/Link';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { intlShape } from 'react-intl';

import DefaultNavigation from '../component/navigation/DefaultNavigation';
import Map from '../component/map/Map';
import DepartureListContainer from '../component/departure/DepartureListContainer';
import StopCardHeader from '../component/stop-cards/StopCardHeader';
import { addFavouriteStop } from '../action/FavouriteActions';
import Icon from '../component/icon/icon';

function StopPage(props, { intl, router, executeAction }) {
  const isTerminal = props.route.name.startsWith('station');
  const prefix = isTerminal ? 'terminaalit' : 'pysakit';
  const id = isTerminal ? props.params.terminalId : props.params.stopId;

  const params = {
    stop_name: props.stop.name,
    stop_code: props.stop.code,
  };

  const title = intl.formatMessage({
    id: 'stop-page.title',
    defaultMessage: 'Stop {stop_name} - {stop_code}',
  }, params);

  const meta = {
    title,
    meta: [{
      name: 'description',
      content: intl.formatMessage({
        id: 'stop-page.description',
        defaultMessage: 'Stop {stop_name} - {stop_code}',
      }, params),
    }],
  };

  const addAsFavouriteStop = e => {
    e.stopPropagation();
    executeAction(addFavouriteStop, id);
  };

  const toggleFullscreenMap = () =>
    router.push(`/${prefix}/${id}${props.fullscreenMap ? '' : '/kartta'}`);

  const contents = props.fullscreenMap ? null : (
    <DepartureListContainer
      stoptimes={props.stop.stoptimes}
      key="departures"
      className="stop-page momentum-scroll"
      routeLinks
      infiniteScroll
      isTerminal={isTerminal}
      rowClasses="padding-normal border-bottom"
    />);

  return (
    <DefaultNavigation className="fullscreen stop" title={title}>
      <Helmet {...meta} />
      <ReactCSSTransitionGroup
        transitionName="stop-page-content"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
        component="div"
        className="stop-page-content"
      >
        <StopCardHeader
          stop={props.stop}
          favourite={props.favourite}
          addFavouriteStop={addAsFavouriteStop}
          key="header"
          className="stop-page header"
          headingStyle="h3"
          infoIcon
        />
        <Map
          className="full"
          lat={props.stop.lat}
          lon={props.stop.lon}
          zoom={16}
          key="map"
          showStops
          hilightedStops={[id]}
          disableZoom={!props.fullscreenMap}
        >
          {props.fullscreenMap ? null :
            <div className="map-click-prevent-overlay" onClick={toggleFullscreenMap} />}
          <Link to={`/${prefix}/${id}${props.fullscreenMap ? '' : '/kartta'}`}>
            <div className="fullscreen-toggle">
              <Icon img="icon-icon_maximize" className="cursor-pointer" />
            </div>
          </Link>
        </Map>
        {contents}
      </ReactCSSTransitionGroup>
    </DefaultNavigation>
  );
}

StopPage.propTypes = {
  params: React.PropTypes.shape({
    stopId: React.PropTypes.string,
    terminalId: React.PropTypes.string,
  }).isRequired,
  stop: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    code: React.PropTypes.string,
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
    stoptimes: React.PropTypes.array,
    platformCode: React.PropTypes.string,
  }),
  favourite: React.PropTypes.bool,
  fullscreenMap: React.PropTypes.bool,
  route: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
  }).isRequired,
};

StopPage.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
  router: React.PropTypes.object.isRequired,
  intl: intlShape,
};

const StopPageContainer = Relay.createContainer(StopPage, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        lat
        lon
        name
        code
        platformCode
        routes {
          gtfsId
          shortName
          longName
          mode
          color
        }
        stoptimes: stoptimesForServiceDate(date: $date) {
          ${DepartureListContainer.getFragment('stoptimes')}
        }
        ${StopCardHeader.getFragment('stop')}
      }
    `,
  },

  initialVariables: {
    date: moment().format('YYYYMMDD'),
  },
});

export default connectToStores(StopPageContainer, ['TimeStore', 'FavouriteStopsStore'],
  ({ getStore }, { params }) => ({
    date: getStore('TimeStore').getCurrentTime().format('YYYYMMDD'),
    favourite: getStore('FavouriteStopsStore').isFavourite(params.stopId),
  }));

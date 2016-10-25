import React from 'react';
import Relay from 'react-relay';
import Link from 'react-router/lib/Link';
import some from 'lodash/some';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';

import Map from '../map/Map';
import Icon from '../icon/Icon';

const getFullscreenTogglePath = (fullscreenMap, params) =>
  `/${
    params.stopId ? 'pysakit' : 'terminaalit'
  }/${
    params.stopId ? params.stopId : params.terminalId
  }${fullscreenMap ? '' : '/kartta'}`;


const fullscreenMapOverlay = (fullscreenMap, params, router) => (
  !fullscreenMap && (
    <div
      className="map-click-prevent-overlay"
      key="overlay"
      onClick={() => router.replace(getFullscreenTogglePath(fullscreenMap, params))}
    />
  )
);

const fullscreenMapToggle = (fullscreenMap, params) => (
  <Link to={getFullscreenTogglePath(fullscreenMap, params)} key="toggle">
    <div className="fullscreen-toggle">
      <Icon img="icon-icon_maximize" className="cursor-pointer" />
    </div>
  </Link>
);

const StopPageMap = compose(
  getContext({
    breakpoint: React.PropTypes.string.isRequired,
    router: React.PropTypes.shape({
      replace: React.PropTypes.func.isRequired,
    }).isRequired,
  }),
  mapProps(props => {
    const fullscreenMap = some(props.routes, 'fullscreenMap');

    return {
      className: 'full',
      lat: props.stop.lat,
      lon: props.stop.lon,
      zoom: !(props.params.stopId) || props.stop.platformCode ? 18 : 16,
      key: 'map',
      showStops: true,
      hilightedStops: [props.params.stopId],
      disableZoom: !fullscreenMap,
      children: props.breakpoint !== 'large' && [
        fullscreenMapOverlay(fullscreenMap, props.params, props.router),
        fullscreenMapToggle(fullscreenMap, props.params),
      ],
    };
  })
)(Map);

export default Relay.createContainer(StopPageMap, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        lat
        lon
        platformCode
      }
    `,
  },
});

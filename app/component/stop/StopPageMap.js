import React from 'react';
import Relay from 'react-relay';
import Link from 'react-router/lib/Link';
import some from 'lodash/some';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';

import Map from '../map/Map';
import Icon from '../icon/icon';


const StopPageMap = compose(
  getContext({ breakpoint: React.PropTypes.string.isRequired }),
  mapProps(props => {
    const prefix = props.params.stopId ? 'pysakit' : 'terminaalit';
    const id = props.params.stopId ? props.params.stopId : props.params.terminalId;
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
      children: [ // TODO: Break into a function(al component)?
        (fullscreenMap || props.breakpoint === 'large' ? null :
          <div className="map-click-prevent-overlay" onClick={() => {}} />),
        props.breakpoint === 'large' ? null :
          <Link to={`/${prefix}/${id}${fullscreenMap ? '' : '/kartta'}`}>
            <div className="fullscreen-toggle">
              <Icon img="icon-icon_maximize" className="cursor-pointer" />
            </div>
          </Link>,
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

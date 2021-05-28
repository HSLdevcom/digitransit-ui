import React from 'react';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape } from 'found';
import PropTypes from 'prop-types';
import BackButton from '../BackButton';
import withBreakpoint from '../../util/withBreakpoint';
import MapWithTracking from './MapWithTracking';
import MapLayerStore, { mapLayerShape } from '../../store/MapLayerStore';

const SidebarMap = ({ mapLayers, match, breakpoint }) => {
  const children = [];
  if (breakpoint !== 'large') {
    children.push(
      <BackButton
        icon="icon-icon_arrow-collapse--left"
        iconClassName="arrow-icon"
        key="stop-page-back-button"
      />,
    );
  }

  return (
    <MapWithTracking
      lat={Number(match.location.query.lat)}
      lon={Number(match.location.query.lng)}
      mapLayers={mapLayers}
      zoom={16}
      className="flex-grow"
    >
      {children}
    </MapWithTracking>
  );
};

SidebarMap.propTypes = {
  mapLayers: mapLayerShape.isRequired,
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
};

const componentWithBreakpoint = withBreakpoint(SidebarMap);

const SidebarMapWithStores = connectToStores(
  componentWithBreakpoint,
  [MapLayerStore],
  ({ getStore }) => {
    const mapLayers = getStore(MapLayerStore).getMapLayers();
    return {
      mapLayers,
    };
  },
);

export {
  SidebarMapWithStores as default,
  componentWithBreakpoint as Component,
};

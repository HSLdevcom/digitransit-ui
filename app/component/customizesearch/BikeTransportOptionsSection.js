import PropTypes from 'prop-types';
import React from 'react';
import { routerShape } from 'react-router';

import Checkbox from '../Checkbox';
import { StreetMode, TransportMode } from '../../constants';
import { toggleTransportMode, setStreetMode } from '../../util/modeUtils';

const BikeTransportOptionsSection = ({ currentModes }, { config, router }) => {
  const onlyBike =
    currentModes.length === 1 && currentModes[0] === StreetMode.Bicycle;
  const isTransportModeEnabled = transportMode =>
    transportMode && transportMode.availableForSelection;
  const transportModes = config.transportModes || {};
  return (
    <React.Fragment>
      <Checkbox
        checked={onlyBike}
        defaultMessage="I'm travelling only by bike"
        disabled={onlyBike}
        key="cb-only-bike"
        labelId="biketransport-only-bike"
        onChange={e => {
          if (e.target.checked) {
            setStreetMode(StreetMode.Bicycle, config, router, true);
          }
        }}
      />
      {isTransportModeEnabled(transportModes.citybike) && (
        <Checkbox
          checked={currentModes.includes(TransportMode.Citybike)}
          defaultMessage="I'm using a citybike"
          key="cb-citybike"
          labelId="biketransport-citybike"
          onChange={() =>
            toggleTransportMode(TransportMode.Citybike, config, router)
          }
        />
      )}
    </React.Fragment>
  );
};

BikeTransportOptionsSection.propTypes = {
  currentModes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

BikeTransportOptionsSection.contextTypes = {
  config: PropTypes.object.isRequired,
  router: routerShape.isRequired,
};

export default BikeTransportOptionsSection;

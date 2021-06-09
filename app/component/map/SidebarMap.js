import React from 'react';
import { matchShape } from 'found';
import StopPageMap from './StopPageMap';

const SidebarMap = ({ match }) => {
  const children = [];

  return (
    <StopPageMap
      stop={{
        name: match.location.query.name || match.location.pathname.substring(1),
        lat: Number(match.location.query.lat),
        lon: Number(match.location.query.lng),
      }}
    >
      {children}
    </StopPageMap>
  );
};

SidebarMap.propTypes = {
  match: matchShape.isRequired,
};

export default SidebarMap;

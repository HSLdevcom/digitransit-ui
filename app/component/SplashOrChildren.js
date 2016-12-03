import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Splash from './Splash';

import config from '../config';
import { getIntroShown } from '../store/localStorage';


const SplashOrComponent = ({ displaySplash, children }) => {
  if (!displaySplash) {
    return children;
  }
  return <Splash />;
};

SplashOrComponent.propTypes = {
  displaySplash: React.PropTypes.bool.isRequired,
  children: React.PropTypes.node.isRequired,
};

export default connectToStores(SplashOrComponent, ['PositionStore', 'EndpointStore'],
  (context) => {
    const origin = context.getStore('EndpointStore').getOrigin();

    return {
      displaySplash: (
        (config.shouldShowIntro && getIntroShown() !== true) ||
        (origin.useCurrentPosition &&
            !context.getStore('PositionStore').getLocationState().hasLocation) ||
        (!origin.useCurrentPosition && (!origin.lat || !origin.lon))), // selected location
    };
  });

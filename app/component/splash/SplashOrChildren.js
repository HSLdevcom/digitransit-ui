import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Splash from './splash';


const SplashOrComponent = ({
  displaySplash,
  state,
  children,
}) => <Splash displaySplash={displaySplash} state={state}>{children}</Splash>;

SplashOrComponent.propTypes = {
  displaySplash: React.PropTypes.bool,
  state: React.PropTypes.string,
  children: React.PropTypes.node,
};

export default connectToStores(SplashOrComponent, ['PositionStore', 'EndpointStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();
    const origin = context.getStore('EndpointStore').getOrigin();
    const { useCurrentPosition } = origin;

    return {
      displaySplash: (useCurrentPosition && !locationState.hasLocation) ||
    (!useCurrentPosition && (!origin.lat || !origin.lon)),
      state: locationState.status === 'no-location' ? 'load' : 'positioning',
      children: props.children,
    };
  });

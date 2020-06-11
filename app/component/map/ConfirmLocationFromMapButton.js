import React from 'react';
import PropTypes from 'prop-types';
import { matchShape, routerShape } from 'found';
import { getRoutePath, getEndpointPath } from '../../util/path';

const ConfirmLocationFromMapButton = props => {
  const redirect = () => {
    if (props.address) {
      const pathname = props.match.location.pathname.substring(1).split('/');
      const itineraryParams = props.match.location.search;

      // origin already set, get destination
      if (pathname[0] !== '-' && pathname[1] === 'SelectFromMap') {
        props.router.push(
          getRoutePath(pathname[0], props.address) + itineraryParams,
        );
      }

      // destination already set, get origin
      if (pathname[0] === 'SelectFromMap' && pathname[1] !== '-') {
        props.router.push(
          getRoutePath(props.address, pathname[1]) + itineraryParams,
        );
      }

      // origin not set, get destination
      if (pathname[0] === '-' && pathname[1] === 'SelectFromMap') {
        props.router.push(getEndpointPath('', props.address) + itineraryParams);
      }

      // destination not set, get origin
      if (pathname[0] === 'SelectFromMap' && pathname[1] === '-') {
        props.router.push(getEndpointPath(props.address, '') + itineraryParams);
      }
    }
  };

  const margin = 20;
  const btnHeight = 50;
  const btnWidth = props.mapSize ? props.mapSize.x - 2 * margin : '';
  const marginBottom = 57;
  const btnRadius = btnHeight / 2;
  const posLeft = margin;
  const posTop = props.mapSize
    ? props.mapSize.y - marginBottom - btnHeight
    : '';
  if (props.isEnabled) {
    return (
      <button
        type="button"
        onClick={redirect}
        style={{
          zIndex: 3000,
          borderRadius: btnRadius,
          backgroundColor: '#007ac9',
          height: btnHeight,
          width: btnWidth,
          left: posLeft,
          top: posTop,
        }}
        key={props.idx}
      >
        {props.name}
      </button>
    );
  } else {
    return (
      <button
        type="button"
        style={{
          zIndex: 3000,
          borderRadius: btnRadius,
          backgroundColor: '#bbbbbb',
          height: btnHeight,
          width: btnWidth,
          left: posLeft,
          top: posTop,
        }}
        key={props.idx}
      >
        {props.name}
      </button>
    );
  }
};

ConfirmLocationFromMapButton.propTypes = {
  address: PropTypes.string,
  idx: PropTypes.string,
  isEnabled: PropTypes.bool,
  mapSize: PropTypes.any,
  match: matchShape,
  name: PropTypes.string,
  router: routerShape,
};

export default ConfirmLocationFromMapButton;

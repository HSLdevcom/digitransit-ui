import PropTypes from 'prop-types';
import React from 'react';
import { routerShape } from 'react-router';
import Checkbox from './Checkbox';

const CityBikeNetworkSelector = (props, { config, router }) => {
  console.log(config);
  return (
    <React.Fragment>
      <Checkbox
        checked
        defaultMessage="Citybike"
        key="cb-helsinki-and-espoo"
        labelId="bike"
        onChange={() => {}}
      />
    </React.Fragment>
  );
};

CityBikeNetworkSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  router: routerShape.isRequired,
};

export default CityBikeNetworkSelector;

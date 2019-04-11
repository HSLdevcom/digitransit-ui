import PropTypes from 'prop-types';
import React from 'react';
import Checkbox from './Checkbox';

const CityBikeNetworkSelector = (
  { updateValue, headerText, currentOptions, isUsingCitybike },
  { config },
) => {
  const mappedCheckboxes = config.citybikeModes.map(network => (
    <Checkbox
      checked={
        isUsingCitybike &&
        currentOptions.find(
          option => option.toUpperCase() === network.networkName.toUpperCase(),
        )
      }
      defaultMessage="Citybike"
      key={`cb-${network.messageId}`}
      labelId={network.messageId}
      onChange={e => {
        updateValue(e.target.name);
      }}
      name={network.networkName}
    />
  ));

  return (
    <React.Fragment>
      <div className="settings-option-container">
        <h1>{headerText}</h1>
        {mappedCheckboxes}
      </div>
    </React.Fragment>
  );
};

CityBikeNetworkSelector.propTypes = {
  updateValue: PropTypes.func.isRequired,
  headerText: PropTypes.string.isRequired,
  currentOptions: PropTypes.array.isRequired,
  isUsingCitybike: PropTypes.bool.isRequired,
};

CityBikeNetworkSelector.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default CityBikeNetworkSelector;

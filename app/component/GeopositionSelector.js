import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { startLocationWatch } from '../action/PositionActions';
import OriginSelectorRow from './OriginSelectorRow';

const GeopositionSelector = (props, context) => (
  <OriginSelectorRow
    key={`panel-locationing-button`}
    icon="icon-icon_position"
    onClick={() => context.executeAction(startLocationWatch)}
    label={
      <FormattedMessage
        id="use-own-position"
        defaultMessage="Use current location"
      />
    }
  />
);

GeopositionSelector.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default GeopositionSelector;

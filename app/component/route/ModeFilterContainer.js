import React from 'react';
import ModeFilter from '../util/ModeFilter';
import ModeSelectedAction from '../../action/mode-selected-action';
import connectToStores from 'fluxible-addons-react/connectToStores';

const ModeFilterContainer = ({ modes, action }) => (
  <ModeFilter
    modes={modes}
    action={action}
    buttonClass="btn mode-nearby"
  />
);

ModeFilterContainer.propTypes = {
  modes: React.PropTypes.object.isRequired,
  action: React.PropTypes.object.isRequired,
};

export default connectToStores(
  ModeFilter,
  ['ModeStore'],
  (context) =>
    ({
      modes: context.getStore('ModeStore').getMode(),
      buttonClass: 'btn mode-nearby',
      action: ModeSelectedAction,
    })
);

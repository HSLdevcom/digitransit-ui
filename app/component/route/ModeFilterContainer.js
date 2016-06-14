import React from 'react';
import ModeFilter from '../util/mode-filter';
import ModeSelectedAction from '../../action/mode-selected-action';

export default function ModeFilterContainer(props, { getStore }) {
  return (
    <ModeFilter
      store={getStore('ModeStore')}
      action={ModeSelectedAction}
      buttonClass="btn mode-icon"
    />
  );
}

ModeFilterContainer.contextTypes = {
  getStore: React.PropTypes.func.isRequired,
};

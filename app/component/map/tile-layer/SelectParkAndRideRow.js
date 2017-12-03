import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import Icon from '../../Icon';
import ComponentUsageExample from '../../ComponentUsageExample';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectParkAndRideRow(props, { intl }) {
  return (
    <div className="no-margin">
      <div className="cursor-pointer select-row" onClick={props.selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <Icon img="icon-icon_car" />
        </div>
        <div className="padding-vertical-normal select-row-text">
          <span className="header-primary no-margin link-color">
            {JSON.parse(props.name)[intl.locale]} ›
          </span>
        </div>
        <div className="clear" />
      </div>
      <hr className="no-margin gray" />
    </div>
  );
}

SelectParkAndRideRow.displayName = 'SelectParkAndRideRow';

SelectParkAndRideRow.description = (
  <div>
    <p>Renders a select citybike row</p>
    <ComponentUsageExample description="">
      <SelectParkAndRideRow
        name={'{"en": "Leppävaara", "fi": "Leppävaara", "sv": "Leppävaara"}'}
        selectRow={() => {}}
      />
    </ComponentUsageExample>
  </div>
);

SelectParkAndRideRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
};

SelectParkAndRideRow.contextTypes = {
  intl: intlShape,
};

export default SelectParkAndRideRow;

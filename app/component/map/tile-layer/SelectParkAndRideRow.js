import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import Icon from '../../Icon';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectParkAndRideRow(props, { intl }) {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div className="stop-popup-choose-row" onClick={props.selectRow}>
      <div className="padding-vertical-normal select-row-icon">
        <Icon img="icon-icon_car" color={props.colors.primary} />
      </div>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">
          {JSON.parse(props.name)[intl.locale]}
        </h5>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
      <hr className="no-margin gray" />
    </div>
  );
}

SelectParkAndRideRow.displayName = 'SelectParkAndRideRow';

SelectParkAndRideRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  colors: PropTypes.object.isRequired,
};

SelectParkAndRideRow.contextTypes = {
  intl: intlShape,
};

export default SelectParkAndRideRow;

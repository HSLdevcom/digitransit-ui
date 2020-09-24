import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../../Icon';
import ComponentUsageExample from '../../ComponentUsageExample';
import { getIcon } from '../popups/TicketSalesPopup';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectTicketSalesRow(props) {
  return (
    <div className="no-margin">
      <div className="cursor-pointer select-row" onClick={props.selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <Icon img={getIcon(props.Tyyppi)} />
        </div>
        <div className="padding-vertical-normal select-row-text">
          <span className="header-primary no-margin link-color">
            {props.Nimi} ›
          </span>
        </div>
        <div className="clear" />
      </div>
      <hr className="no-margin gray" />
    </div>
  );
}

SelectTicketSalesRow.displayName = 'SelectTicketSalesRow';

SelectTicketSalesRow.description = () => (
  <div>
    <p>Renders a select ticket sales row</p>
    <ComponentUsageExample description="">
      <SelectTicketSalesRow selectRow={() => {}} />
    </ComponentUsageExample>
  </div>
);

SelectTicketSalesRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  Tyyppi: PropTypes.string.isRequired,
  Nimi: PropTypes.string.isRequired,
};

export default SelectTicketSalesRow;

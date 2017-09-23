import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../../Icon';
import ComponentUsageExample from '../../ComponentUsageExample';
import { getIcon } from '../popups/TicketSalesPopup';

function SelectTicketSalesRow(props) {
  return (
    <div className="no-margin">
      <div className="cursor-pointer select-row" onClick={props.selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <Icon img={getIcon(props.TYYPPI)} />
        </div>
        <div className="padding-vertical-normal select-row-text">
          <span className="header-primary no-margin link-color">
            {props.NIMI} ›
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
  TYYPPI: PropTypes.string.isRequired,
  NIMI: PropTypes.string.isRequired,
};

export default SelectTicketSalesRow;

import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import ComponentUsageExample from '../../ComponentUsageExample';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
class SelectCovid19OpeningHoursRow extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  static propTypes = {
    selectRow: PropTypes.func.isRequired,
    name: PropTypes.string,
    brand: PropTypes.string,
    cat: PropTypes.string.isRequired,
  };

  render() {
    const { name, brand, cat, selectRow } = this.props;
    const translatedCat = this.context.intl.formatMessage({
      id: `poi-${cat}`,
      defaultMessage: cat,
    });
    return (
      <div className="no-margin">
        <div className="cursor-pointer select-row" onClick={selectRow}>
          <div className="padding-vertical-normal select-row-icon" />
          <div className="padding-vertical-normal select-row-text">
            <span className="header-primary no-margin link-color">
              {name || brand || translatedCat} ›
            </span>
          </div>
          <div className="clear" />
        </div>
        <hr className="no-margin gray" />
      </div>
    );
  }
}

SelectCovid19OpeningHoursRow.description = () => (
  <div>
    <p>Renders a select ticket sales row</p>
    <ComponentUsageExample description="">
      <SelectCovid19OpeningHoursRow selectRow={() => {}} />
    </ComponentUsageExample>
  </div>
);

export default SelectCovid19OpeningHoursRow;

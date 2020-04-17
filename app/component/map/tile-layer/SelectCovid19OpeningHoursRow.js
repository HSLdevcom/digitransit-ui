import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import ComponentUsageExample from '../../ComponentUsageExample';
import Icon from '../../Icon';
import Covid19OpeningHours from './Covid19OpeningHours';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectCovid19OpeningHoursRow(props, context) {
  const { name, brand, cat, normalizedCat, selectRow } = props;
  const translatedCat = context.intl.formatMessage({
    id: `poi-${cat}`,
    defaultMessage: cat,
  });

  return (
    <div className="no-margin">
      <div className="cursor-pointer select-row" onClick={selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <Icon
            img={Covid19OpeningHours.getIcon(cat, normalizedCat)}
            viewBox="0 0 18 18"
            width={0.7}
            height={0.7}
          />
        </div>
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

SelectCovid19OpeningHoursRow.contextTypes = {
  intl: intlShape.isRequired,
};

SelectCovid19OpeningHoursRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  name: PropTypes.string,
  brand: PropTypes.string,
  cat: PropTypes.string.isRequired,
  normalizedCat: PropTypes.string.isRequired,
};

SelectCovid19OpeningHoursRow.description = () => (
  <div>
    <p>Renders a select ticket sales row</p>
    <ComponentUsageExample description="">
      <SelectCovid19OpeningHoursRow selectRow={() => {}} />
    </ComponentUsageExample>
  </div>
);

export default SelectCovid19OpeningHoursRow;

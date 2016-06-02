import React from 'react';
import Icon from '../../icon/icon';
import ComponentUsageExample from '../../documentation/ComponentUsageExample';

function SelectCityBikeRow(props) {
  return (
    <div className="no-margin">
      <hr className="no-margin" />
      <div className="cursor-pointer" onClick={props.selectRow}>
        <div
          className="left padding-vertical-small"
          style={{ width: 40, fontSize: '2em', paddingLeft: 8 }}
        >
          <Icon img="icon-icon_citybike" />
        </div>
        <div className="left padding-vertical-normal" style={{ width: 'calc(100% - 40px)' }}>
          <span className="h4 no-margin link-color">{props.name} ›</span>
        </div>
        <div className="clear">
        </div>
      </div>
    </div>
  );
}

SelectCityBikeRow.displayName = 'SelectCityBikeRow';

SelectCityBikeRow.description = (
  <div>
    <p>Renders a select citybike row</p>
    <ComponentUsageExample description="">
      <SelectCityBikeRow name={'LINNANMÄKI'} selectRow={() => {}} />
    </ComponentUsageExample>
  </div>
  );

SelectCityBikeRow.propTypes = {
  selectRow: React.PropTypes.func.isRequired,
  name: React.PropTypes.string.isRequired,
};

export default SelectCityBikeRow;

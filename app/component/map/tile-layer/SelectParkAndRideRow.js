import React from 'react';
import Icon from '../../icon/icon';
import ComponentUsageExample from '../../documentation/ComponentUsageExample';

function SelectParkAndRideRow(props) {
  return (
    <div className="no-margin">
      <hr className="no-margin" />
      <div className="cursor-pointer" onClick={props.selectRow}>
        <div
          className="left padding-vertical-small"
          style={{ width: 40, fontSize: '2em', paddingLeft: 8 }}
        >
          <Icon img="icon-icon_car" />
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

SelectParkAndRideRow.displayName = 'SelectParkAndRideRow';

SelectParkAndRideRow.description = (
  <div>
    <p>Renders a select citybike row</p>
    <ComponentUsageExample description="">
      <SelectParkAndRideRow name={'Leppävaara'} selectRow={() => {}} />
    </ComponentUsageExample>
  </div>
  );

SelectParkAndRideRow.propTypes = {
  selectRow: React.PropTypes.func.isRequired,
  name: React.PropTypes.string.isRequired,
};

export default SelectParkAndRideRow;

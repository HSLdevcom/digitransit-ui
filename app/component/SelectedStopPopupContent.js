import React from 'react';

import ComponentUsageExample from './ComponentUsageExample';

const SelectedStopPopupContent = ({ stop }) => (
  <div className="origin-popup">
    <div className="origin-popup-header">
      <div className="selected-stop-header">
        {stop.name}
      </div>
    </div>
    {(stop.code || stop.desc) && (
      <div>
        <div className="origin-popup-name">
          <div className="selected-stop-popup">
            {stop.code && <p className="card-code">{stop.code}</p>}
            <span className="description">{stop.desc}</span>
          </div>
        </div>
        <div className="shade-to-white" />
      </div>
    )}
  </div>
);

SelectedStopPopupContent.propTypes = {
  stop: React.PropTypes.object.isRequired,
};

SelectedStopPopupContent.displayName = 'SelectedStopPopupContent';

SelectedStopPopupContent.description = () =>
  <div>
    <p>Renders a popup with the selected stop</p>
    <ComponentUsageExample description="example">
      <SelectedStopPopupContent
        stop={{ name: 'Name', code: '123', desc: 'Desc' }}
      />
    </ComponentUsageExample>
  </div>;

export default SelectedStopPopupContent;

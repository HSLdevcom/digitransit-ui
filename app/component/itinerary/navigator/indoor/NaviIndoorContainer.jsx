import PropTypes from 'prop-types';
import React from 'react';
import { configShape } from '../../../../util/shapes';
import { IndoorStepType, VerticalDirection } from '../../../../constants';
import NaviIndoorStepInfo from './NaviIndoorStepInfo';
import { getStepFocusAction } from '../../../../util/indoorUtils';

function NaviIndoorContainer({ focusToPoint, indoorSteps }) {
  return (
    <div className="navi-indoor-step-container">
      <div className="navi-indoor-step-line-container">
        <div className="navi-indoor-step-line-circle-container">
          {indoorSteps.map((step, i) => (
            <React.Fragment
              // eslint-disable-next-line react/no-array-index-key
              key={`naviindoorsteplinecircle_lat_${step.lat}_lon_${step.lon}_i_${i}`}
            >
              <div className="navi-indoor-step-line-circle">
                <svg width={28} height={28}>
                  <circle
                    className="indoor-step-marker"
                    width={28}
                    cx={11}
                    cy={18}
                    r={6}
                    strokeWidth={4}
                  />
                </svg>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="navi-indoor-step-line indoor-dotted-line" />
      </div>
      <div className="navi-indoor-step-info-container">
        {indoorSteps.map((step, i) => (
          <NaviIndoorStepInfo
            // eslint-disable-next-line react/no-array-index-key
            key={`naviindoorstepinfo_lat_${step.lat}_lon_${step.lon}_index_i_${i}`}
            // eslint-disable-next-line no-underscore-dangle
            type={step.feature?.__typename}
            verticalDirection={step.feature?.verticalDirection}
            toLevelName={step.feature?.to?.name}
            focusAction={getStepFocusAction(step.lat, step.lon, focusToPoint)}
          />
        ))}
      </div>
    </div>
  );
}

NaviIndoorContainer.propTypes = {
  focusToPoint: PropTypes.func.isRequired,
  indoorSteps: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(Object.values(IndoorStepType)),
      feature: PropTypes.shape({
        verticalDirection: PropTypes.oneOf(Object.values(VerticalDirection)),
        to: PropTypes.shape({
          name: PropTypes.string,
        }),
      }),
    }),
  ),
};

NaviIndoorContainer.defaultProps = {
  indoorSteps: [],
};

NaviIndoorContainer.contextTypes = {
  config: configShape.isRequired,
};

export default NaviIndoorContainer;

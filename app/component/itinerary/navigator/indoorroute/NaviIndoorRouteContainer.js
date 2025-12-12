import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { configShape } from '../../../../util/shapes';
import { IndoorRouteStepType, VerticalDirection } from '../../../../constants';
import NaviIndoorRouteStepInfo from './NaviIndoorRouteStepInfo';
import { getStepFocusAction } from '../../../../util/indoorUtils';

function NaviIndoorRouteContainer({ focusToPoint, indoorRouteSteps }) {
  const [indoorBackgroundImageUrl, setIndoorBackgroundImageUrl] = useState();
  useEffect(() => {
    import(
      /* webpackChunkName: "indoor-dotted-line" */ `../../../../configurations/images/default/indoor-dotted-line.svg`
    ).then(insideImageUrl => {
      setIndoorBackgroundImageUrl(`url(${insideImageUrl.default})`);
    });
  }, []);

  return (
    <div className="navi-indoor-route-step-container">
      <div className="navi-indoor-route-step-line-container">
        <div className="navi-indoor-route-step-line-circle-container">
          {indoorRouteSteps.map((step, i) => (
            <React.Fragment
              // eslint-disable-next-line react/no-array-index-key
              key={`naviindoorroutesteplinecircle_lat_${step.lat}_lon_${step.lon}_i_${i}`}
            >
              <div className="navi-indoor-route-step-line-circle">
                <svg width={28} height={28}>
                  <circle
                    className="indoor-route-step-marker"
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
        <div
          style={{
            backgroundImage: indoorBackgroundImageUrl,
          }}
          className="navi-indoor-route-step-line"
        />
      </div>
      <div className="navi-indoor-route-step-info-container">
        {indoorRouteSteps.map((step, i) => (
          <NaviIndoorRouteStepInfo
            // eslint-disable-next-line react/no-array-index-key
            key={`naviindoorroutestepinfo_lat_${step.lat}_lon_${step.lon}_index_i_${i}`}
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

NaviIndoorRouteContainer.propTypes = {
  focusToPoint: PropTypes.func.isRequired,
  indoorRouteSteps: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(Object.values(IndoorRouteStepType)),
      feature: PropTypes.shape({
        verticalDirection: PropTypes.oneOf(Object.values(VerticalDirection)),
        to: PropTypes.shape({
          name: PropTypes.string,
        }),
      }),
    }),
  ),
};

NaviIndoorRouteContainer.defaultProps = {
  indoorRouteSteps: [],
};

NaviIndoorRouteContainer.contextTypes = {
  config: configShape.isRequired,
};

export default NaviIndoorRouteContainer;

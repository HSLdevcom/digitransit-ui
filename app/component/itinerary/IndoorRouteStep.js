import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { configShape } from '../../util/shapes';
import Icon from '../Icon';
import {
  getIndoorRouteTranslationId,
  getVerticalTransportationUseIconId,
} from '../../util/indoorUtils';
import {
  IndoorRouteLegType,
  IndoorRouteStepType,
  VerticalDirection,
} from '../../constants';
import ItineraryMapAction from './ItineraryMapAction';

function IndoorRouteStep({
  focusAction,
  type,
  verticalDirection,
  toLevelName,
  isLastPlace,
  onlyOneStep,
  indoorRouteLegType,
}) {
  const [defaultBackgroundImageUrl, setDefaultBackgroundImageUrl] = useState();
  const [indoorBackgroundImageUrl, setIndoorBackgroundImageUrl] = useState();
  useEffect(() => {
    Promise.all([
      import(
        /* webpackChunkName: "dotted-line" */ `../../configurations/images/default/dotted-line.svg`
      ),
      import(
        /* webpackChunkName: "indoor-dotted-line" */ `../../configurations/images/default/indoor-dotted-line.svg`
      ),
    ]).then(([defaultImageUrl, insideImageUrl]) => {
      setDefaultBackgroundImageUrl(`url(${defaultImageUrl.default})`);
      setIndoorBackgroundImageUrl(`url(${insideImageUrl.default})`);
    });
  }, []);

  const indoorTranslationId = getIndoorRouteTranslationId(
    type,
    verticalDirection,
    toLevelName,
  );

  return (
    <div
      style={{ width: '100%', position: 'relative' }}
      className="row itinerary-row"
    >
      <div className="small-offset-2 leg-before indoor-step">
        <div
          className={cx('leg-before-circle', 'circle-fill', 'indoor-step', {
            'only-one-step': onlyOneStep,
          })}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
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
        <div
          style={{
            backgroundImage:
              isLastPlace &&
              indoorRouteLegType ===
                IndoorRouteLegType.StepsBeforeEntranceInside
                ? defaultBackgroundImageUrl
                : indoorBackgroundImageUrl,
          }}
          className={cx('leg-before-line', 'indoor-step', {
            'only-one-step': onlyOneStep,
          })}
        />
      </div>
      <div className="small-9 columns itinerary-instruction-column intermediate indoor-step">
        <div
          className={cx('itinerary-leg-row-intermediate-indoor-step', {
            'only-one-step': onlyOneStep,
          })}
        >
          <Icon
            img={getVerticalTransportationUseIconId(
              verticalDirection,
              type,
              false,
            )}
            className="itinerary-intermediate-indoor-route-icon"
          />
          <div className="itinerary-intermediate-indoor-route-step-info">
            <FormattedMessage
              id={indoorTranslationId}
              defaultMessage="Indoor step"
              values={{ toLevelName }}
            />
          </div>
          <ItineraryMapAction target="" focusAction={focusAction} />
        </div>
      </div>
    </div>
  );
}

IndoorRouteStep.propTypes = {
  focusAction: PropTypes.func.isRequired,
  type: PropTypes.oneOf(Object.values(IndoorRouteStepType)).isRequired,
  verticalDirection: PropTypes.oneOf(Object.values(VerticalDirection)),
  toLevelName: PropTypes.string,
  isLastPlace: PropTypes.bool,
  onlyOneStep: PropTypes.bool,
  indoorRouteLegType: PropTypes.oneOf(Object.values(IndoorRouteLegType)),
};

IndoorRouteStep.defaultProps = {
  verticalDirection: undefined,
  toLevelName: undefined,
  isLastPlace: false,
  onlyOneStep: false,
  indoorRouteLegType: IndoorRouteLegType.NoStepsInside,
};

IndoorRouteStep.contextTypes = {
  config: configShape.isRequired,
};

export default IndoorRouteStep;

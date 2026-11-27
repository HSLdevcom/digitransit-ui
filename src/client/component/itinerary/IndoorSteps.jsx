import PropTypes from 'prop-types';
import IndoorStep from './IndoorStep';
import { getStepFocusAction } from '../../utils/indoorUtils';

export default function IndoorSteps({ steps, indoorLegType, focusToPoint }) {
  return (
    <div className="itinerary-leg-container">
      {steps.map((step, i) => (
        <IndoorStep
          // eslint-disable-next-line react/no-array-index-key
          key={`indoorstep_lat_${step.lat}_lon_${step.lon}_i_${i}`}
          // eslint-disable-next-line no-underscore-dangle
          type={step.feature?.__typename}
          verticalDirection={step.feature?.verticalDirection}
          toLevelName={step.feature?.to?.name}
          focusAction={getStepFocusAction(step.lat, step.lon, focusToPoint)}
          isLastPlace={i === steps.length - 1}
          onlyOneStep={steps.length === 1}
          indoorLegType={indoorLegType}
        />
      ))}
    </div>
  );
}

IndoorSteps.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.object).isRequired,
  indoorLegType: PropTypes.string,
  focusToPoint: PropTypes.func.isRequired,
};

import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../../../Icon';
import { legShape } from '../../../../util/shapes';
import {
  getIndoorStepsWithVerticalTransportation,
  getStepFocusAction,
} from '../../../../util/indoorUtils';
import NaviIndoorStepInfo from './NaviIndoorStepInfo';
import NaviIndoorButton from './NaviIndoorButton';
import { NaviCardType } from '../../../../constants';

export default function NaviIndoorButtonContainer({
  currentCard,
  setCurrentCard,
  previousLeg,
  leg,
  nextLeg,
  focusToPoint,
}) {
  const indoorSteps = getIndoorStepsWithVerticalTransportation(
    previousLeg,
    leg,
    nextLeg,
  );
  if (indoorSteps.length === 1) {
    return (
      <div className="navi-indoor-one-step-info-container">
        <Icon img="navi-expand" className="icon-expand-small" />
        <NaviIndoorStepInfo
          // eslint-disable-next-line no-underscore-dangle
          type={indoorSteps[0].feature?.__typename}
          verticalDirection={indoorSteps[0].feature?.verticalDirection}
          toLevelName={indoorSteps[0].feature?.to?.name}
          focusAction={getStepFocusAction(
            indoorSteps[0].lat,
            indoorSteps[0].lon,
            focusToPoint,
          )}
        />
      </div>
    );
  }
  if (indoorSteps.length > 1) {
    return (
      <NaviIndoorButton
        currentCard={currentCard}
        setCurrentCard={setCurrentCard}
      />
    );
  }
  return null;
}

NaviIndoorButtonContainer.propTypes = {
  currentCard: PropTypes.oneOf(Object.values(NaviCardType)),
  setCurrentCard: PropTypes.func.isRequired,
  previousLeg: legShape,
  leg: legShape,
  nextLeg: legShape,
  focusToPoint: PropTypes.func.isRequired,
};

NaviIndoorButtonContainer.defaultProps = {
  currentCard: NaviCardType.Default,
  previousLeg: undefined,
  leg: undefined,
  nextLeg: undefined,
};

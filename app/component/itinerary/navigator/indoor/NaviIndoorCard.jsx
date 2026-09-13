import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { configShape, legShape } from '../../../../util/shapes.js';
import { getIndoorStepsWithVerticalTransportation } from '../../../../util/indoorUtils.js';
import NaviIndoorButton from './NaviIndoorButton.jsx';
import NaviIndoorContainer from './NaviIndoorContainer.jsx';
import { NaviCardType } from '../../../../constants.js';

function NaviIndoorCard({
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
  return (
    <div className={cx('extension', 'no-vertical-margin')}>
      <div className="extension-divider" />
      <div className="extension-indoor-button">
        <NaviIndoorButton
          currentCard={NaviCardType.Indoor}
          setCurrentCard={setCurrentCard}
        />
      </div>
      <div className="extension-divider no-vertical-margin" />
      <div className="extension-indoor-container">
        <NaviIndoorContainer
          focusToPoint={focusToPoint}
          indoorSteps={indoorSteps}
        />
      </div>
    </div>
  );
}

NaviIndoorCard.propTypes = {
  setCurrentCard: PropTypes.func.isRequired,
  focusToPoint: PropTypes.func.isRequired,
  previousLeg: legShape,
  leg: legShape,
  nextLeg: legShape,
};

NaviIndoorCard.defaultProps = {
  previousLeg: undefined,
  leg: undefined,
  nextLeg: undefined,
};

NaviIndoorCard.contextTypes = {
  config: configShape.isRequired,
};

export default NaviIndoorCard;

import PropTypes from 'prop-types';
import cx from 'classnames';
import { legShape } from '../../../../utils/shapes';
import { getIndoorStepsWithVerticalTransportation } from '../../../../utils/indoorUtils';
import NaviIndoorButton from './NaviIndoorButton';
import NaviIndoorContainer from './NaviIndoorContainer';
import { NaviCardType } from '../../../../../shared/utils/constants';

export default function NaviIndoorCard({
  setCurrentCard,
  previousLeg,
  leg,
  nextLeg,
  focusToPoint,
}) {
  const indoorSteps = getIndoorStepsWithVerticalTransportation(previousLeg, leg, nextLeg);
  return (
    <div className={cx('extension', 'no-vertical-margin')}>
      <div className="extension-divider" />
      <div className="extension-indoor-button">
        <NaviIndoorButton currentCard={NaviCardType.Indoor} setCurrentCard={setCurrentCard} />
      </div>
      <div className="extension-divider no-vertical-margin" />
      <div className="extension-indoor-container">
        <NaviIndoorContainer focusToPoint={focusToPoint} indoorSteps={indoorSteps} />
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

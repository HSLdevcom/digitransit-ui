import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import NaviTopInfo from './NaviTopInfo';
import { legShape } from '../../util/shapes';

const getCardType = nextLeg => {
  const { realTimeState, start, realTime } = nextLeg;

  if (realTimeState === 'CANCELED') {
    return {
      backgroundColor: '#DC0451',
      iconColor: '#888',
      iconId: 'icon-icon_caution_white_exclamation',
    };
  }
  // TODO HANDLE THIS BETTER
  if (start.estimate?.delay > 0) {
    return {
      backgroundColor: '#FFB6C1',
      iconColor: '#000',
      iconId: 'icon-icon_delay',
    };
  }

  if (!realTime) {
    return {
      backgroundColor: '#FFFF00',
      iconColor: '#000',
      iconId: 'icon-icon_info',
    };
  }

  return {
    backgroundColor: '#0074be',
    iconColor: '#FFF',
    iconId: 'icon-icon_info',
  };
};

const NaviInfoStack = (
  { transferProblem, nextLeg, canceled, show },
  { intl },
) => {
  const type = getCardType(nextLeg);
  const mode = nextLeg.mode.toLowerCase();
  const localizedMode = intl.formatMessage({
    id: `${mode}`,
    defaultMessage: `${mode}`,
  });
  return (
    <div
      style={{ backgroundColor: type.backgroundColor }}
      className={cx('info-stack', show ? 'slide-in' : 'slide-out')}
    >
      <NaviTopInfo
        transferProblem={transferProblem}
        canceled={canceled}
        nextLeg={nextLeg}
        mode={localizedMode}
        {...type}
      />
    </div>
  );
};
NaviInfoStack.propTypes = {
  transferProblem: PropTypes.arrayOf(legShape),
  nextLeg: legShape,
  canceled: PropTypes.bool,
  show: PropTypes.bool.isRequired,
};

NaviInfoStack.defaultProps = {
  transferProblem: null,
  canceled: false,
  nextLeg: null,
};

NaviInfoStack.contextTypes = {
  intl: intlShape.isRequired,
};
export default NaviInfoStack;

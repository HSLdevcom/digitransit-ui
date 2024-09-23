import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import NaviInfo from './NaviInfo';
import { legShape } from '../../util/shapes';

const getInfo = nextLeg => {
  const { realTimeState, start, realTime, to } = nextLeg;
  const { estimatedTime, scheduledTime } = start;

  if (realTimeState === 'CANCELED') {
    // Todo: No current design
    return {
      backgroundColor: '#DC0451',
      iconColor: '#888',
      iconId: 'icon-icon_caution_white_exclamation',
    };
  }
  if (start.estimate?.delay > 0) {
    // Todo: No current design
    return {
      backgroundColor: '#FDF3F6',
      iconColor: '#DC0451',
      iconId: 'icon-icon_delay',
    };
  }

  if (!realTime) {
    return {
      backgroundColor: '#FFF8E8',
      iconColor: '#FED100',
      iconId: 'icon-icon_info',
      scheduledTime,
      stopName: to.stop.name,
    };
  }

  return {
    backgroundColor: '##0074BF',
    iconColor: '#FFF',
    iconId: 'icon-icon_info',
    estimatedTime,
    parentStation: to.stop.parentStation,
  };
};

const NaviStack = ({ transferProblem, nextLeg, canceled, show }, { intl }) => {
  const info = getInfo(nextLeg);
  const mode = nextLeg.mode.toLowerCase();
  const localizedMode = intl.formatMessage({
    id: `${mode}`,
    defaultMessage: `${mode}`,
  });
  return (
    <div
      style={{ backgroundColor: info.backgroundColor }}
      className={cx('info-stack', show ? 'slide-in' : 'slide-out')}
    >
      <NaviInfo
        transferProblem={transferProblem}
        canceled={canceled}
        nextLeg={nextLeg}
        mode={localizedMode}
        {...info}
      />
    </div>
  );
};
NaviStack.propTypes = {
  transferProblem: PropTypes.arrayOf(legShape),
  nextLeg: legShape,
  canceled: PropTypes.bool,
  show: PropTypes.bool.isRequired,
};

NaviStack.defaultProps = {
  transferProblem: null,
  canceled: false,
  nextLeg: null,
};

NaviStack.contextTypes = {
  intl: intlShape.isRequired,
};
export default NaviStack;

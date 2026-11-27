import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { legShape } from '../../utils/shapes';
import { displayDistance } from '../../../shared/utils/geo-utils';
import { durationToString } from '../../utils/timeUtils';
import { getFromLocalizedMode, getToLocalizedMode } from '../../utils/modeUtils';
import { useConfigContext } from '../../hooks/ConfigContext';
import LegDetails from './LegDetails';

const MESSAGE_IDS = {
  from: {
    withDuration: 'bicycle-walk-from-transit',
    noDuration: 'bicycle-walk-from-transit-no-duration',
  },
  to: {
    withDuration: 'bicycle-walk-to-transit',
    noDuration: 'bicycle-walk-to-transit-no-duration',
  },
};

/**
 * Instruction for walking the bike from or to a transit stop.
 */
export default function BicycleWalkNote({ walkLeg, direction, target, focusAction }) {
  const intl = useIntl();
  const config = useConfigContext();
  const ids = MESSAGE_IDS[direction];
  const getLocalizedMode = direction === 'from' ? getFromLocalizedMode : getToLocalizedMode;
  const transportMode = getLocalizedMode(walkLeg[direction].stop.vehicleMode, intl);

  return (
    <LegDetails target={target} focusAction={focusAction}>
      {walkLeg.distance === -1 ? (
        <FormattedMessage id={ids.noDuration} values={{ transportMode }} />
      ) : (
        <FormattedMessage
          id={ids.withDuration}
          values={{
            transportMode,
            duration: durationToString(intl, walkLeg.duration * 1000),
            distance: displayDistance(walkLeg.distance, config, intl.formatNumber),
          }}
        />
      )}
    </LegDetails>
  );
}

BicycleWalkNote.propTypes = {
  walkLeg: legShape.isRequired,
  direction: PropTypes.oneOf(['from', 'to']).isRequired,
  target: PropTypes.string.isRequired,
  focusAction: PropTypes.func.isRequired,
};

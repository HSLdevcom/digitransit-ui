import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { legShape, legTimeShape } from '../../utils/shapes';
import { durationToString } from '../../utils/timeUtils';
import ShowOnMapButton from './ShowOnMapButton';
import LegAction from './LegAction';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import { PREFIX_STOPS } from '../../../shared/utils/path';
import { legTimeStr, getValidatedLegName, isCallAgencyLeg } from '../../utils/legUtils';
import { splitStringToAddressAndPlace } from '../../../shared/utils/otpStrings';
import { ViaLocationType } from '../../../shared/utils/constants';
import LegTimeColumn from './LegTimeColumn';
import LegPlaceLink from './LegPlaceLink';

export default function WaitLeg({
  children,
  leg,
  start,
  waitTime,
  focusAction,
  index,
  icon,
  hasPreviousTransitLeg = false,
}) {
  const intl = useIntl();
  const legName = getValidatedLegName(leg.to.name, intl, true);
  const duration = durationToString(intl, waitTime);
  const [address, place] = splitStringToAddressAndPlace(legName);

  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage id="wait-amount-of-time" values={{ duration }} />
      </span>
      <LegTimeColumn time={legTimeStr(start)} />
      <LegCircleLineWithIcon
        modeClassName="wait"
        index={index}
        icon={icon}
        isNotFirstLeg
        hasPreviousTransitLeg={hasPreviousTransitLeg}
      />
      <div className="small-9 columns itinerary-instruction-column wait">
        <div className="itinerary-leg-first-row wait">
          <div className="itinerary-leg-row">
            {isCallAgencyLeg(leg) ? (
              <div className="address-container">
                <div className="address">{address}</div>
                <div className="place">{place}</div>
              </div>
            ) : (
              <LegPlaceLink
                to={`/${PREFIX_STOPS}/${leg.to.stop.gtfsId}`}
                isViaPoint={leg.from.viaLocationType === ViaLocationType.PassThrough}
              >
                {legName}
              </LegPlaceLink>
            )}
            <div className="stop-code-container">{children}</div>
          </div>
          <ShowOnMapButton target={legName} focusAction={focusAction} />
        </div>
        <LegAction focusAction={focusAction}>
          <FormattedMessage id="wait-amount-of-time" values={{ duration: `(${duration})` }} />
        </LegAction>
      </div>
    </div>
  );
}

WaitLeg.propTypes = {
  start: legTimeShape.isRequired,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  children: PropTypes.node,
  waitTime: PropTypes.number.isRequired,
  leg: legShape.isRequired,
  icon: PropTypes.string,
  hasPreviousTransitLeg: PropTypes.bool,
};

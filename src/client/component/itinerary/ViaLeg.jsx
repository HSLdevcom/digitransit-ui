import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { legShape, legTimeShape } from '../../utils/shapes';
import { durationToString } from '../../utils/timeUtils';
import { legTime, legTimeStr, legSummaryValues, getValidatedLegName } from '../../utils/legUtils';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import ShowOnMapButton from './ShowOnMapButton';
import LegAction from './LegAction';
import { splitStringToAddressAndPlace } from '../../../shared/utils/otpStrings';
import { useConfigContext } from '../../hooks/ConfigContext';

const DESCRIPTION_IDS = {
  BICYCLE_WALK: 'cyclewalk-distance-duration',
  BICYCLE: 'cycle-distance-duration',
};

export default function ViaLeg({ leg, arrival, index, children, focusAction, focusToLeg }) {
  const config = useConfigContext();
  const intl = useIntl();
  const values = legSummaryValues(intl, config, leg);
  const { time: startTime, distance, duration } = values;
  const [name, place] = splitStringToAddressAndPlace(
    getValidatedLegName(leg.from.name, intl, true),
  );
  const address = leg.from.viaLocationType && leg.viaAddress ? leg.viaAddress : name;
  const arrivalTime = legTimeStr(arrival);
  const stayDuration = legTime(leg.start) - legTime(arrival);
  const leaveAction = intl.formatMessage(
    { id: leg.mode === 'BICYCLE' ? 'itinerary-details.biking-leg' : 'itinerary-details.walk-leg' },
    values,
  );
  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.via-leg"
          values={{ arrivalTime, viaPoint: leg.from.name, leaveAction }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column via-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time via-arrival-time">{arrivalTime}</div>
        <div className="itinerary-time-column-time via-divider">
          <div className="via-divider-line" />
        </div>
        <div className="itinerary-time-column-time via-departure-time">{startTime}</div>
      </div>
      <LegCircleLineWithIcon
        viaType={leg.from.viaLocationType}
        isStop={!!leg.from.stop}
        index={index}
        modeClassName={leg.mode.toLowerCase()}
      />
      <div className="small-9 columns itinerary-instruction-column via">
        <div className="itinerary-leg-first-row via">
          <div>
            <div className="address-container">
              <div className="address">{address}</div>
              <div className="place">{place}</div>
            </div>
            {stayDuration > 0 && (
              <div className="itinerary-via-leg-duration">
                <FormattedMessage
                  id="via-leg-stop-duration"
                  values={{ stayDuration: durationToString(intl, stayDuration) }}
                />
              </div>
            )}
            {children}
          </div>
          <ShowOnMapButton target={leg.from.name || ''} focusAction={focusAction} />
        </div>
        <LegAction focusAction={focusToLeg}>
          <FormattedMessage
            id={DESCRIPTION_IDS[leg.mode] || 'walk-distance-duration'}
            values={{ distance, duration }}
          />
        </LegAction>
      </div>
    </div>
  );
}

ViaLeg.propTypes = {
  arrival: legTimeShape.isRequired,
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  children: PropTypes.node,
};

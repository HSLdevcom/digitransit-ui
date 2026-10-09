import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import { legShape, legTimeShape } from '../../../utils/client/shapes';
import { legTimeStr } from '../../../utils/client/legUtils';
import ItineraryCircleLine from './ItineraryCircleLine';
import Icon from '../Icon';
import ItineraryMapAction from './ItineraryMapAction';
import { stopPagePath } from '../../../utils/shared/path';
import { useConfigContext } from '../../client/ConfigContext';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
export default function AirportCheckInLeg({
  leg,
  start,
  focusAction,
  index,
  children,
}) {
  const config = useConfigContext();
  const modeClassName = 'airport-wait';
  const { name } = leg.from;
  return (
    <div className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">{legTimeStr(start)}</div>
      </div>
      <ItineraryCircleLine index={index} modeClassName={modeClassName} />
      <div
        onClick={focusAction}
        className="small-9 columns itinerary-instruction-column airport-wait"
      >
        <div className="itinerary-leg-first-row">
          <div className="itinerary-leg-row">
            <Link
              onClick={e => {
                e.stopPropagation();
              }}
              to={stopPagePath(false, leg.from.stop.gtfsId)}
            >
              {name}
              <Icon
                img="icon_arrow-collapse--right"
                className="itinerary-arrow-icon"
                color={config.colors.primary}
              />
            </Link>
            <div className="stop-code-container">{children}</div>
          </div>
          <ItineraryMapAction target={name || ''} focusAction={focusAction} />
        </div>

        <div className="info-message">
          <Icon img="icon_info" />
          <FormattedMessage
            id="airport-check-in"
            values={{ agency: leg.agency && leg.agency.name }}
            defaultMessage="Check-in at the {agency} desk"
          />
        </div>
        <div className="info-message">
          <Icon img="icon_info" />
          <FormattedMessage
            id="airport-security-check-go-to-gate"
            defaultMessage="Proceed to your gate through security check"
          />
        </div>
      </div>
    </div>
  );
}

AirportCheckInLeg.propTypes = {
  leg: legShape.isRequired,
  start: legTimeShape.isRequired,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  children: PropTypes.node,
};

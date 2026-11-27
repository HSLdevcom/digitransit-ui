import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { legShape, legTimeShape } from '../../utils/shapes';
import { legTimeStr } from '../../utils/legUtils';
import LegCircleLine from './LegCircleLine';
import LegTimeColumn from './LegTimeColumn';
import Icon from '../Icon';
import ShowOnMapButton from './ShowOnMapButton';
import { stopPagePath } from '../../../shared/utils/path';
import LegPlaceLink from './LegPlaceLink';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
export default function AirportCheckInLeg({ leg, start, focusAction, index, children }) {
  const modeClassName = 'airport-wait';
  const { name } = leg.from;
  return (
    <div className="row itinerary-row">
      <span className="sr-only">{legTimeStr(start)}</span>
      <LegTimeColumn time={legTimeStr(start)} />
      <LegCircleLine index={index} modeClassName={modeClassName} />
      <div
        onClick={focusAction}
        className="small-9 columns itinerary-instruction-column airport-wait"
      >
        <div className="itinerary-leg-first-row">
          <div className="itinerary-leg-row">
            <LegPlaceLink to={stopPagePath(false, leg.from.stop.gtfsId)}>{name}</LegPlaceLink>
            <div className="stop-code-container">{children}</div>
          </div>
          <ShowOnMapButton target={name || ''} focusAction={focusAction} />
        </div>

        <div className="info-message">
          <Icon img="icon_info" />
          <FormattedMessage
            id="airport-check-in"
            values={{ agency: leg.agency && leg.agency.name }}
          />
        </div>
        <div className="info-message">
          <Icon img="icon_info" />
          <FormattedMessage id="airport-security-check-go-to-gate" />
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

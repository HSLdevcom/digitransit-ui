import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import { legShape } from '../../utils/shapes';
import { legTimeStr } from '../../utils/legUtils';
import Icon from '../Icon';
import LegCircleLine from './LegCircleLine';
import LegTimeColumn from './LegTimeColumn';
import ShowOnMapButton from './ShowOnMapButton';
import { stopPagePath } from '../../../shared/utils/path';
import { useConfigContext } from '../../hooks/ConfigContext';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
export default function AirportCollectLuggageLeg({ index, leg, focusAction, children }) {
  const config = useConfigContext();
  const modeClassName = 'airport-wait';
  const { name } = leg.to;
  return (
    <div className="row itinerary-row">
      <span className="sr-only">{legTimeStr(leg.end)}</span>
      <LegTimeColumn time={legTimeStr(leg.end)} />
      <LegCircleLine index={index} modeClassName={modeClassName} />
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
              to={stopPagePath(false, leg.to.stop.gtfsId)}
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
          <ShowOnMapButton target={name || ''} focusAction={focusAction} />
        </div>

        <div className="info-message">
          <Icon img="icon_info" />
          <FormattedMessage id="airport-collect-luggage" defaultMessage="Collect your luggage" />
        </div>
      </div>
    </div>
  );
}

AirportCollectLuggageLeg.propTypes = {
  index: PropTypes.number.isRequired,
  leg: legShape.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node,
};

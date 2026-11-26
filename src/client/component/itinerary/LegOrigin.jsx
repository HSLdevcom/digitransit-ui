import PropTypes from 'prop-types';
import Link from 'found/Link';
import Icon from '../Icon';
import { addAnalyticsEvent } from '../../../shared/utils/analyticsUtils';
import { splitStringToAddressAndPlace } from '../../../shared/utils/otpStrings';
import { stopPagePath } from '../../../shared/utils/path';
import { legShape } from '../../utils/shapes';
import { useConfigContext } from '../../hooks/ConfigContext';

/**
 * Name of the place where a transit leg starts. A call agency leg has no stop page to link to,
 * and a flex trip origin is shown as an address and a place.
 */
export default function LegOrigin({ leg, mode, index, name }) {
  const config = useConfigContext();
  const viaIcon = leg.from.viaLocationType && (
    <Icon img="icon_mapMarker" className="itinerary-mapmarker-icon" />
  );

  if (mode !== 'call') {
    return (
      <Link
        aria-label={name?.toLowerCase()}
        onClick={e => {
          e.stopPropagation();
          addAnalyticsEvent({
            category: 'Itinerary',
            action: 'OpenRouteFromItinerary',
            name: mode,
          });
        }}
        to={stopPagePath(false, leg.from.stop.gtfsId)}
      >
        {name}
        {viaIcon}
        <Icon
          img="icon_arrow-collapse--right"
          className="itinerary-arrow-icon"
          color={config.colors.primary}
        />
      </Link>
    );
  }

  if (index !== 0) {
    return <span>{name}</span>;
  }

  const [address, place] = splitStringToAddressAndPlace(name || '');
  return (
    <span>
      <div className="address-container">
        <div className="address">
          {address}
          {viaIcon}
        </div>
        <div className="place">{place}</div>
      </div>
    </span>
  );
}

LegOrigin.propTypes = {
  leg: legShape.isRequired,
  mode: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string,
};

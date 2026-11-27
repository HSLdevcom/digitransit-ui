import PropTypes from 'prop-types';
import Link from 'found/Link';
import Icon from '../Icon';
import ServiceAlertIcon from '../ServiceAlertIcon';
import { hasEntitiesOfType } from '../../utils/alertUtils';
import { AlertEntityType, AlertSeverityLevelType } from '../../../shared/utils/constants';
import { PREFIX_DISRUPTION, routePagePath, stopPagePath } from '../../../shared/utils/path';
import { legShape } from '../../utils/shapes';
import { useConfigContext } from '../../hooks/ConfigContext';

const linkedSeverityLevels = [
  AlertSeverityLevelType.Warning,
  AlertSeverityLevelType.Severe,
  AlertSeverityLevelType.Unknown,
];

/**
 * Link to the disruption page for a leg alert. Shown only for alerts more serious than info.
 */
export default function LegAlertLink({ leg, alert, severityLevel }) {
  const config = useConfigContext();
  if (!linkedSeverityLevels.includes(severityLevel)) {
    return null;
  }

  return (
    <div className="disruption disruption-link-container">
      <Link
        to={
          (hasEntitiesOfType(alert, AlertEntityType.Route) &&
            routePagePath(leg.route.gtfsId, PREFIX_DISRUPTION, leg.trip.pattern.code)) ||
          (hasEntitiesOfType(alert, AlertEntityType.Stop) &&
            stopPagePath(false, alert.entities[0].gtfsId, PREFIX_DISRUPTION))
        }
        className="disruption-link"
      >
        <div className="disruption-icon">
          <ServiceAlertIcon className="inline-icon" severityLevel={severityLevel} />
        </div>
        <div className="description">
          {config.showAlertHeader ? alert.alertHeaderText : alert.alertDescriptionText}
        </div>
        <Icon
          img="icon_arrow-collapse--right"
          className="disruption-link-arrow"
          color={config.colors.primary}
        />
      </Link>
    </div>
  );
}

LegAlertLink.propTypes = {
  leg: legShape.isRequired,
  alert: PropTypes.shape({
    alertHeaderText: PropTypes.string,
    alertDescriptionText: PropTypes.string,
    entities: PropTypes.arrayOf(PropTypes.shape({ gtfsId: PropTypes.string })),
  }),
  severityLevel: PropTypes.string,
};

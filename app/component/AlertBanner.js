import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'found';
import TruncateMarkup from 'react-truncate-markup';
import { alertShape } from '../util/shapes';
import Icon from './Icon';
import { alertSeverityCompare } from '../util/alertUtils';
import { useConfigContext } from '../configurations/ConfigContext';

export default function AlertBanner({ alerts, linkAddress }) {
  const { colors } = useConfigContext();
  const alert = [...alerts].sort(alertSeverityCompare)[0];
  const message = alert.alertDescriptionText;
  const header = alert.alertHeaderText;
  if (!message && !header) {
    return null;
  }
  const icon =
    alert.alertSeverityLevel !== 'INFO'
      ? 'icon_caution_white_exclamation'
      : 'icon_info';
  const iconColor =
    alert.alertSeverityLevel !== 'INFO' ? colors.caution : '#888';
  return (
    <Link
      className={`alert-banner-link ${alert.alertSeverityLevel.toLowerCase()}`}
      onClick={e => {
        e.stopPropagation();
      }}
      to={`${linkAddress}`}
    >
      <div className="alert-container">
        <Icon img={icon} color={iconColor} />
        <div className="alert-text">
          <TruncateMarkup lines={2} ellipsis={<span>... </span>}>
            <div>{header || message}</div>
          </TruncateMarkup>
        </div>
        <div className="arrow-icon">
          <Icon img="icon_arrow-collapse--right" color={colors.primary} />
        </div>
      </div>
    </Link>
  );
}

AlertBanner.propTypes = {
  alerts: PropTypes.arrayOf(alertShape).isRequired,
  linkAddress: PropTypes.string.isRequired,
};

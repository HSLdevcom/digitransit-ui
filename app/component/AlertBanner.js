import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'found';
import TruncateMarkup from 'react-truncate-markup';
import Icon from './Icon';
import { alertSeverityCompare } from '../util/alertUtils';

const AlertBanner = ({ alerts, linkAddress }, { config }) => {
  const alert = [...alerts].sort(alertSeverityCompare)[0];
  const message = alert.alertDescriptionText;
  const header = alert.alertHeaderText;
  if (!message && !header) {
    return null;
  }
  const icon =
    alert.alertSeverityLevel !== 'INFO'
      ? 'icon-icon_caution_white_exclamation'
      : 'icon-icon_info';
  const iconColor = alert.alertSeverityLevel !== 'INFO' ? '#DC0451' : '#888';
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
          <Icon
            img="icon-icon_arrow-collapse--right"
            color={config.colors.primary}
          />{' '}
        </div>
      </div>
    </Link>
  );
};

AlertBanner.propTypes = {
  alerts: PropTypes.array.isRequired,
  linkAddress: PropTypes.string.isRequired,
};
AlertBanner.contextTypes = {
  config: PropTypes.object.isRequired,
};
export default AlertBanner;

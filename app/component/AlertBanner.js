import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'found';
import TruncateMarkup from 'react-truncate-markup';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Icon from './Icon';
import {
  getServiceAlertDescription,
  alertSeverityCompare,
  getServiceAlertHeader,
} from '../util/alertUtils';

const AlertBanner = ({ alerts, linkAddress, language }, { config }) => {
  const alert = [...alerts].sort(alertSeverityCompare)[0];
  const message = getServiceAlertDescription(alert, language);
  const header = getServiceAlertHeader(alert, language);
  if (!message && !header) {
    return <></>;
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

const connectedComponent = connectToStores(
  AlertBanner,
  ['PreferencesStore'],
  ({ getStore }) => ({
    language: getStore('PreferencesStore').getLanguage(),
  }),
);
AlertBanner.propTypes = {
  alerts: PropTypes.array.isRequired,
  linkAddress: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
};
AlertBanner.contextTypes = {
  config: PropTypes.object.isRequired,
};
export default connectedComponent;

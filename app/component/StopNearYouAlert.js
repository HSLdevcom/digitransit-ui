import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'found';
import TruncateMarkup from 'react-truncate-markup';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Icon from './Icon';
import {
  getServiceAlertDescription,
  alertSeverityCompare,
} from '../util/alertUtils';

const StopNearYouAlert = ({ stop, linkAddress, language }, { config }) => {
  const alert = stop.alerts.sort(alertSeverityCompare)[0];
  const message = getServiceAlertDescription(alert, language);
  const icon =
    alert.alertSeverityLevel === 'SEVERE'
      ? 'icon-icon_caution_white_exclamation'
      : 'icon-icon_info';
  const iconColor = alert.alertSeverityLevel === 'SEVERE' ? '#DC0451' : '#888';
  return (
    <Link
      className="alert-link"
      onClick={e => {
        e.stopPropagation();
      }}
      to={`${linkAddress}/hairiot`}
    >
      <div className="alert-container">
        <Icon img={icon} color={iconColor} />
        <div className="alert-text">
          <TruncateMarkup lines={2} ellipsis={<span>... </span>}>
            <div>{message}</div>
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
  StopNearYouAlert,
  ['PreferencesStore'],
  ({ getStore }) => ({
    language: getStore('PreferencesStore').getLanguage(),
  }),
);
StopNearYouAlert.propTypes = {
  stop: PropTypes.object.isRequired,
  linkAddress: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
};
StopNearYouAlert.contextTypes = {
  config: PropTypes.object.isRequired,
};
export default connectedComponent;

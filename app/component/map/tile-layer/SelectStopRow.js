import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import Icon from '../../Icon';
import StopScheduleStatus from '../../stop/StopScheduleStatus';
import { stopPagePath } from '../../../util/path';
import { getStopMode, transitIconName } from '../../../util/modeUtils';
import { getModeIconColor } from '../../../util/colorUtils';
import getStopStatus, {
  combineStopStatuses,
} from '../../../util/stopStatusUtils';
import { useConfigContext } from '../../../configurations/ConfigContext';

function isNull(val) {
  return val === 'null' || val === undefined || val === null;
}

const parseEffects = str =>
  str && str !== 'null'
    ? str
        .split(',')
        .map(e => e.trim())
        .filter(Boolean)
    : [];

function SelectStopRow({
  code = undefined,
  type,
  desc = undefined,
  gtfsId,
  name,
  terminal = undefined,
  routes = undefined,
  platform = undefined,
  closedByServiceAlert = undefined,
  servicesRunningInFuture = undefined,
  servicesRunningOnServiceDate = undefined,
  mostSevereAlertSeverityLevel = undefined,
  mostSevereAlertsEffects: alertEffectsProp = undefined,
  hybridSiblingProperties = undefined,
}) {
  const config = useConfigContext();
  const mode = getStopMode(type, routes, code, config, terminal);
  const iconOptions = {};
  iconOptions.iconId = transitIconName(
    mode,
    !(terminal || (mode === 'ferry' && !isNull(code))),
  );
  iconOptions.className = mode;
  iconOptions.color = getModeIconColor(config, mode);

  const showDesc = desc && desc !== 'null';
  const showCode = code && code !== 'null';

  const ownStatus = getStopStatus({
    showStopStatusMarkers: config.showStopStatusMarkers,
    closedByServiceAlert,
    servicesRunningOnServiceDate,
    servicesRunningInFuture,
    alertSeverityLevel: mostSevereAlertSeverityLevel,
  });

  const ownAlertEffects = [...new Set(parseEffects(alertEffectsProp))];
  const alertEffects = ownAlertEffects.length > 0 ? ownAlertEffects : null;

  let status;
  if (hybridSiblingProperties) {
    const siblingStatus = getStopStatus({
      showStopStatusMarkers: config.showStopStatusMarkers,
      closedByServiceAlert: hybridSiblingProperties.closedByServiceAlert,
      servicesRunningOnServiceDate:
        hybridSiblingProperties.servicesRunningOnServiceDate,
      servicesRunningInFuture: hybridSiblingProperties.servicesRunningInFuture,
      alertSeverityLevel: hybridSiblingProperties.mostSevereAlertSeverityLevel,
    });
    status = combineStopStatuses(ownStatus, siblingStatus);
  } else {
    status = ownStatus;
  }
  return (
    <Link className="stop-popup-choose-row" to={stopPagePath(terminal, gtfsId)}>
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon
          className={iconOptions.className}
          img={iconOptions.iconId}
          color={iconOptions.color || null}
        />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{name}</h5>
        <div
          className={`choose-row-info-row ${platform ? 'small-margin' : ''}`}
        >
          {(showDesc || showCode) && (
            <span className="choose-row-text">
              {showDesc && <span className="choose-row-address">{desc}</span>}
              {showCode && <span className="choose-row-number">{code}</span>}
            </span>
          )}
        </div>
        <div className="choose-row-info-row small-margin">
          {platform && (
            <span className="choose-row-text">
              <span className="choose-row-platform">
                <FormattedMessage id="platform" defaultMessage="platform" />
              </span>
              <span className="platform-number-wrapper">{platform}</span>
            </span>
          )}
        </div>
        <StopScheduleStatus
          status={status}
          alertEffects={alertEffects}
          className="choose-row-status"
        />
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

SelectStopRow.displayName = 'SelectStopRow';

SelectStopRow.propTypes = {
  gtfsId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  routes: PropTypes.string,
  code: PropTypes.string,
  desc: PropTypes.string,
  terminal: PropTypes.bool,
  platform: PropTypes.string,
  closedByServiceAlert: PropTypes.bool,
  servicesRunningInFuture: PropTypes.bool,
  servicesRunningOnServiceDate: PropTypes.bool,
  mostSevereAlertSeverityLevel: PropTypes.string,
  mostSevereAlertsEffects: PropTypes.string,
  hybridSiblingProperties: PropTypes.shape({
    closedByServiceAlert: PropTypes.bool,
    servicesRunningInFuture: PropTypes.bool,
    servicesRunningOnServiceDate: PropTypes.bool,
    mostSevereAlertSeverityLevel: PropTypes.string,
    mostSevereAlertsEffects: PropTypes.string,
  }),
};

export default SelectStopRow;

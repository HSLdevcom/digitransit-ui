import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import AlertList from './AlertList';
import Icon from './Icon';
import { AlertSeverityLevelType, AlertEntityType } from '../constants';
import {
  getEntitiesOfTypeFromAlert,
  hasEntitiesOfType,
  hasEntitiesOfTypes,
  isAlertValid,
} from '../util/alertUtils';
import { isKeyboardSelectionEvent } from '../util/browser';
import withBreakpoint from '../util/withBreakpoint';
import { alertShape } from '../util/shapes';

const isDisruption = alert =>
  alert && alert.alertSeverityLevel !== AlertSeverityLevelType.Info;
const isInfo = alert => !isDisruption(alert);

const splitAlertByRouteModeAndColor = alert => {
  const entitiesByModeAndColor = {};
  alert.entities?.forEach(entity => {
    // eslint-disable-next-line no-underscore-dangle
    if (entity.__typename === AlertEntityType.Route) {
      const color = entity.color ? entity.color.toLowerCase() : null;
      const mapKey = `${entity.mode}-${color}`;
      entitiesByModeAndColor[mapKey] = entitiesByModeAndColor[mapKey] || [];
      entitiesByModeAndColor[mapKey].push(entity);
    }
  });
  return Object.values(entitiesByModeAndColor).map(entities => {
    return { ...alert, entities };
  });
};

function DisruptionListContainer(
  { breakpoint, currentTime, viewer, onClickLink },
  { intl },
) {
  const validAlerts = viewer?.alerts
    ?.filter(alert => isAlertValid(alert, currentTime))
    .filter(alert =>
      hasEntitiesOfTypes(alert, [AlertEntityType.Route, AlertEntityType.Stop]),
    );

  if (!validAlerts || validAlerts.length === 0) {
    return (
      <div className="no-alerts-container">
        <FormattedMessage
          id="disruption-info-no-alerts"
          defaultMessage="No known disruptions or diversions."
        />
      </div>
    );
  }

  const disruptionCount = validAlerts.filter(isDisruption).length;
  const infoCount = validAlerts.filter(isInfo).length;

  const [showDisruptions, setShowDisruptions] = useState(disruptionCount > 0);

  const routeAlertsToShow = validAlerts
    .filter(alert => hasEntitiesOfType(alert, AlertEntityType.Route))
    .filter(showDisruptions ? isDisruption : isInfo)
    .map(alert => {
      return {
        ...alert,
        entities: getEntitiesOfTypeFromAlert(alert, AlertEntityType.Route),
      };
    })
    .flatMap(splitAlertByRouteModeAndColor);
  const stopAlertsToShow = validAlerts
    .filter(alert => hasEntitiesOfType(alert, AlertEntityType.Stop))
    .filter(showDisruptions ? isDisruption : isInfo)
    .map(alert => {
      return {
        ...alert,
        entities: getEntitiesOfTypeFromAlert(alert, AlertEntityType.Stop),
      };
    });

  return (
    <div className="disruption-list-container">
      <div
        className={cx('stop-tab-container', {
          collapsed: !disruptionCount || !infoCount,
        })}
      >
        <div
          className={cx('stop-tab-singletab', {
            active: showDisruptions,
          })}
          onClick={() => setShowDisruptions(true)}
          onKeyDown={e =>
            isKeyboardSelectionEvent(e) && setShowDisruptions(true)
          }
          role="button"
          tabIndex="0"
        >
          <div className="stop-tab-singletab-container">
            <div>
              <Icon
                className="stop-page-tab_icon caution"
                img="icon-icon_caution"
              />
            </div>
            <div>
              {`${intl.formatMessage({
                id: 'disruptions',
              })} (${disruptionCount})`}
            </div>
          </div>
        </div>
        <div
          className={cx('stop-tab-singletab', {
            active: !showDisruptions,
          })}
          onClick={() => setShowDisruptions(false)}
          onKeyDown={e =>
            isKeyboardSelectionEvent(e) && setShowDisruptions(false)
          }
          role="button"
          tabIndex="0"
        >
          <div className="stop-tab-singletab-container">
            <div>
              <Icon className="stop-page-tab_icon info" img="icon-icon_info" />
            </div>
            <div>
              {`${intl.formatMessage({
                id: 'releases',
              })} (${infoCount})`}
            </div>
          </div>
        </div>
      </div>
      <div
        className={cx('disruption-list-content momentum-scroll', {
          'disruption-list-content__large': breakpoint === 'large',
        })}
      >
        {routeAlertsToShow.length > 0 && (
          <React.Fragment>
            <div>
              <FormattedMessage id="routes" tagName="h2" />
            </div>
            <AlertList
              disableScrolling
              showLinks
              serviceAlerts={routeAlertsToShow}
              onClickLink={onClickLink}
            />
          </React.Fragment>
        )}
        {stopAlertsToShow.length > 0 && (
          <React.Fragment>
            <div>
              <FormattedMessage id="stops" tagName="h2" />
            </div>
            <AlertList
              disableScrolling
              showLinks
              serviceAlerts={stopAlertsToShow}
              onClickLink={onClickLink}
            />
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

DisruptionListContainer.contextTypes = {
  intl: intlShape,
};

DisruptionListContainer.propTypes = {
  breakpoint: PropTypes.string,
  currentTime: PropTypes.number.isRequired,
  viewer: PropTypes.shape({
    alerts: PropTypes.arrayOf(alertShape),
  }).isRequired,
  onClickLink: PropTypes.func,
};

DisruptionListContainer.defaultProps = {
  breakpoint: 'small',
  onClickLink: undefined,
};

const containerComponent = createFragmentContainer(
  connectToStores(
    withBreakpoint(DisruptionListContainer),
    ['TimeStore'],
    context => ({
      currentTime: context.getStore('TimeStore').getCurrentTime(),
    }),
  ),
  {
    viewer: graphql`
      fragment DisruptionListContainer_viewer on QueryType
      @argumentDefinitions(feedIds: { type: "[String!]", defaultValue: [] }) {
        alerts(feeds: $feedIds) {
          feed
          id
          alertDescriptionText
          alertHash
          alertHeaderText
          alertSeverityLevel
          alertUrl
          effectiveEndDate
          effectiveStartDate
          entities {
            __typename
            ... on Stop {
              name
              code
              vehicleMode
              gtfsId
            }
            ... on Route {
              color
              type
              mode
              shortName
              gtfsId
            }
          }
        }
      }
    `,
  },
);

export { containerComponent as default, DisruptionListContainer as Component };

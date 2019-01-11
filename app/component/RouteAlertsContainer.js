import cx from 'classnames';
import orderBy from 'lodash/orderBy';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, intlShape } from 'react-intl';
import find from 'lodash/find';
import connectToStores from 'fluxible-addons-react/connectToStores';

import RouteAlertsRow from './RouteAlertsRow';

const getAlerts = (route, patternId, currentTime, intl) => {
  const routeMode = route.mode.toLowerCase();
  const routeLine = route.shortName;
  const { color } = route;

  return orderBy(route.alerts, alert => alert.effectiveStartDate)
    .filter(
      alert =>
        patternId && alert.trip && alert.trip.pattern
          ? alert.trip.pattern.code === patternId
          : true,
    )
    .map(alert => {
      // Try to find the alert in user's language, or failing in English, or failing in any language
      // TODO: This should be a util function that we use everywhere
      // TODO: We should match to all languages user's browser lists as acceptable
      let header = find(alert.alertHeaderTextTranslations, [
        'language',
        intl.locale,
      ]);
      if (!header) {
        header = find(alert.alertHeaderTextTranslations, ['language', 'en']);
      }
      if (!header) {
        [header] = alert.alertHeaderTextTranslations;
      }
      if (header) {
        header = header.text;
      }

      // Unfortunately nothing in GTFS-RT specifies that if there's one string in a language then
      // all other strings would also be available in the same language...
      let description = find(alert.alertDescriptionTextTranslations, [
        'language',
        intl.locale,
      ]);
      if (!description) {
        description = find(alert.alertDescriptionTextTranslations, [
          'language',
          'en',
        ]);
      }
      if (!description) {
        [description] = alert.alertDescriptionTextTranslations;
      }
      if (description) {
        description = description.text;
      }

      const startTime = alert.effectiveStartDate * 1000;
      const endTime = alert.effectiveEndDate * 1000;

      return (
        <RouteAlertsRow
          key={alert.id}
          routeMode={routeMode}
          color={color ? `#${color}` : null}
          routeLine={routeLine}
          header={header}
          description={description}
          expired={startTime > currentTime || currentTime > endTime}
        />
      );
    });
};

function RouteAlertsContainer(
  { route, patternId, currentTime, isScrollable },
  { intl },
) {
  const hasAlert =
    Array.isArray(route.alerts) &&
    route.alerts.length > 0 &&
    (patternId && route.alerts.some(alert => alert.trip)
      ? route.alerts.some(
          alert =>
            alert.trip &&
            alert.trip.pattern &&
            alert.trip.pattern.code === patternId,
        )
      : true);
  return hasAlert ? (
    <div
      className={cx('route-alerts-list', {
        'momentum-scroll': isScrollable,
      })}
    >
      {getAlerts(route, patternId, currentTime, intl)}
    </div>
  ) : (
    <div className="no-alerts-message">
      <FormattedMessage
        id="disruption-info-route-no-alerts"
        defaultMessage="No known disruptions or diversions for route."
      />
    </div>
  );
}

RouteAlertsContainer.propTypes = {
  currentTime: PropTypes.object,
  isScrollable: PropTypes.bool,
  patternId: PropTypes.string,
  route: PropTypes.object.isRequired,
};

RouteAlertsContainer.defaultProps = {
  isScrollable: true,
  patternId: undefined,
};

RouteAlertsContainer.contextTypes = {
  intl: intlShape,
};

const RouteAlertsContainerWithTime = connectToStores(
  RouteAlertsContainer,
  ['TimeStore'],
  context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime(),
  }),
);

const containerComponent = Relay.createContainer(RouteAlertsContainerWithTime, {
  fragments: {
    route: () => Relay.QL`
        fragment on Route {
          mode
          color
          shortName
          alerts {
            id
            alertHeaderTextTranslations {
              text
              language
            }
            alertDescriptionTextTranslations {
              text
              language
            }
            effectiveStartDate
            effectiveEndDate
            trip {
              pattern {
                code
              }
            }
          }
        }
      `,
  },
});

export { containerComponent as default, RouteAlertsContainer as Component };

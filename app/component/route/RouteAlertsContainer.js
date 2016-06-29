import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage, intlShape } from 'react-intl';
import moment from 'moment';
import find from 'lodash/find';
import connectToStores from 'fluxible-addons-react/connectToStores';

import RouteAlertsRow from './RouteAlertsRow';


const getAlerts = (route, currentTime, intl) => {
  const routeMode = route.type.toLowerCase();
  const routeLine = route.shortName;

  return route.alerts.map(alert => {
    const { id } = alert;
    const header = find(alert.alertHeaderTextTranslations,
                               ['language', intl.locale]);
    const description = find(alert.alertDescriptionTextTranslations,
                               ['language', intl.locale]);
    const startTime = moment(alert.effectiveStartDate * 1000);
    const endTime = moment(alert.effectiveEndDate * 1000);
    const alertDate = endTime.format('DD.MM.YYYY');
    const expired = endTime < currentTime;

    let day;
    switch (currentTime.diff(endTime, 'days')) {
      case 0:
        day = <FormattedMessage id="today" defaultMessage="Today" />;
        break;
      case 1:
        day = <FormattedMessage id="yesterday" defaultMessage="Yesterday" />;
        break;
      default:
        day = alertDate;
    }

    return (
      <RouteAlertsRow
        key={id}
        startTime={startTime.format('HH:mm')}
        endTime={endTime.format('HH:mm')}
        header={header ? header.text : null}
        description={description ? description.text : null}
        day={day}
        routeMode={routeMode}
        routeLine={routeLine}
        expired={expired}
      />);
  });
};

function RouteAlertsContainer({ route, currentTime }, { intl }) {
  if (route.alerts.length === 0) {
    return (
      <div className="no-alerts-message">
        <FormattedMessage
          id="disruption-info-no-alerts"
          defaultMessage="No disruption info."
        />
      </div>);
  }

  return (
    <div className="route-alerts-list momentum-scroll">
      {getAlerts(route, currentTime, intl)}
    </div>);
}

RouteAlertsContainer.propTypes = {
  route: React.PropTypes.object.isRequired,
  currentTime: React.PropTypes.object,
};

RouteAlertsContainer.contextTypes = {
  intl: intlShape,
};

const RouteAlertsContainerWithTime = connectToStores(
  RouteAlertsContainer,
  ['TimeStore'],
  context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime(),
  })
);


export default Relay.createContainer(RouteAlertsContainerWithTime,
  {
    fragments: {
      route: () => Relay.QL`
        fragment on Route {
          type
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
          }
        }
      `,
    },
  }
);

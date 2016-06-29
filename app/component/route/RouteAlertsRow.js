import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import RouteNumber from '../departure/RouteNumber';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import { routeAlert as exampleRouteAlert } from '../documentation/ExampleData';

export default function RouteAlertsRow({
  header,
  description,
  startTime,
  endTime,
  routeMode,
  routeLine,
  day,
  expired,
}) {
  const timePrefix = <FormattedMessage id="time-at" defaultMessage="at" />;

  return (
    <div className={cx('route-alert-row', { expired })}>
      <RouteNumber mode={routeMode} text={routeLine} vertical />
      <div className="route-alert-contents">
        <div className="route-alert-duration">
          {day} {timePrefix} {`${startTime} - ${endTime}`}
        </div>
        <div className={cx('route-alert-header', routeMode)}>
          {header}
        </div>
        <div className="route-alert-body">
          {description}
        </div>
      </div>
    </div>
  );
}

RouteAlertsRow.propTypes = {
  header: React.PropTypes.string,
  description: React.PropTypes.string.isRequired,
  startTime: React.PropTypes.string.isRequired,
  endTime: React.PropTypes.string.isRequired,
  routeMode: React.PropTypes.string.isRequired,
  routeLine: React.PropTypes.string.isRequired,
  day: React.PropTypes.string.isRequired,
  expired: React.PropTypes.bool.isRequired,
};

RouteAlertsRow.description = (
  <div>
    <p>
      Display a disruption alert for a specific route.
    </p>
    <ComponentUsageExample
      description="Currently active disruption"
    >
      <RouteAlertsRow
        header={'Raitiolinja 2 - Myöhästyy'}
        description={exampleRouteAlert.alertDescriptionTextTranslations[0].text}
        startTime={'11:32'}
        endTime={'12:20'}
        routeMode={'tram'}
        routeLine={'2'}
        day={'Today'}
        expired={false}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="Past disruption" >
      <RouteAlertsRow
        header={'Raitiolinja 2 - Myöhästyy'}
        description={exampleRouteAlert.alertDescriptionTextTranslations[0].text}
        startTime={'11:32'}
        endTime={'12:20'}
        routeMode={'tram'}
        routeLine={'2'}
        day={'Yesterday'}
        expired
      />
    </ComponentUsageExample>
  </div>);

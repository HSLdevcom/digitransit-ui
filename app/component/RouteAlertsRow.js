import React from 'react';
import cx from 'classnames';
import RouteNumber from './RouteNumber';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';

export default function RouteAlertsRow({
  header,
  description,
  startTime,
  endTime,
  routeMode,
  routeLine,
  expired,
}) {
  return (
    <div className={cx('route-alert-row', { expired })}>
      <RouteNumber mode={routeMode} text={routeLine} vertical />
      <Icon img="icon-icon_caution" className="caution" />
      <div className="route-alert-contents">
        <div className="route-alert-duration">
          {startTime} – {endTime}
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
  expired: React.PropTypes.bool.isRequired,
};

RouteAlertsRow.description = () =>
  <div>
    <p>
      Display a disruption alert for a specific route.
    </p>
    <div className="route-alerts-list">
      <ComponentUsageExample
        description="Currently active disruption"
      >
        <RouteAlertsRow
          header={'Raitiolinja 2 - Myöhästyy'}
          description={'Raitiolinjat: 2 Kaivopuiston suuntaan ja 3 Nordenskiöldinkadun ' +
            'suuntaan, myöhästyy. Syy: tekninen vika. Paikka: Kauppatori, Hakaniemi. ' +
            'Arvioitu kesto: 14:29 - 15:20.'}
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
          description={'Raitiolinjat: 2 Kaivopuiston suuntaan ja 3 Nordenskiöldinkadun ' +
            'suuntaan, myöhästyy. Syy: tekninen vika. Paikka: Kauppatori, Hakaniemi. ' +
            'Arvioitu kesto: 14:29 - 15:20.'}
          startTime={'11:32'}
          endTime={'12:20'}
          routeMode={'tram'}
          routeLine={'2'}
          day={'Yesterday'}
          expired
        />
      </ComponentUsageExample>
    </div>
  </div>;

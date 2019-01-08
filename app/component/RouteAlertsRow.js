import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import RouteNumber from './RouteNumber';
import ComponentUsageExample from './ComponentUsageExample';

export default function RouteAlertsRow({
  header,
  description,
  routeMode,
  routeLine,
  expired,
  color,
}) {
  return (
    <div className={cx('route-alert-row', { expired })}>
      <RouteNumber
        color={color}
        hasDisruption
        mode={routeMode}
        text={routeLine}
        vertical
      />
      <div className="route-alert-contents">
        <div className={cx('route-alert-header', routeMode)}>{header}</div>
        <div className="route-alert-body">{description}</div>
      </div>
    </div>
  );
}

RouteAlertsRow.propTypes = {
  header: PropTypes.string,
  description: PropTypes.string.isRequired,
  routeMode: PropTypes.string.isRequired,
  routeLine: PropTypes.string.isRequired,
  expired: PropTypes.bool.isRequired,
  color: PropTypes.string,
};

RouteAlertsRow.description = () => (
  <div>
    <p>Display a disruption alert for a specific route.</p>
    <div className="route-alerts-list">
      <ComponentUsageExample description="Currently active disruption">
        <RouteAlertsRow
          header="Raitiolinja 2 - Myöhästyy"
          description={
            'Raitiolinjat: 2 Kaivopuiston suuntaan ja 3 Nordenskiöldinkadun ' +
            'suuntaan, myöhästyy. Syy: tekninen vika. Paikka: Kauppatori, Hakaniemi. ' +
            'Arvioitu kesto: 14:29 - 15:20.'
          }
          routeMode="tram"
          routeLine="2"
          expired={false}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="Past disruption">
        <RouteAlertsRow
          header="Raitiolinja 2 - Myöhästyy"
          description={
            'Raitiolinjat: 2 Kaivopuiston suuntaan ja 3 Nordenskiöldinkadun ' +
            'suuntaan, myöhästyy. Syy: tekninen vika. Paikka: Kauppatori, Hakaniemi. ' +
            'Arvioitu kesto: 14:29 - 15:20.'
          }
          routeMode="tram"
          routeLine="2"
          expired
        />
      </ComponentUsageExample>
    </div>
  </div>
);

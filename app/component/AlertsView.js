import React from 'react';
import moment from 'moment';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { TransportMode } from '../constants';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import { typeToName } from '../util/gtfs';

const sortAlerts = (a, b) => {
  // Agency alerts first
  // eslint-disable-next-line no-underscore-dangle
  if (a.__typename === 'Agency' && b.__typename !== 'Agency') {
    return -1;
  }
  // eslint-disable-next-line no-underscore-dangle
  if (a.__typename !== 'Agency' && b.__typename === 'Agency') {
    return 1;
  }
  // otherwise sort by effectiveStartDate, ascending
  return (a.effectiveStartDate || 0) - (b.effectiveStartDate || 0);
};

// TODO
// import {localizeDate} from '../util/timeUtils.js';
// TODO `L` includes the year, which we usually don't want in digitransit-ui
// we need a localized "current-year-aware" formatting
// with Luxon, one might use https://moment.github.io/luxon/api-docs/index.html#datetimetolocaleparts ?
const localizeDate = dateTime => {
  return moment(dateTime).format('dd L');
};

export function AlertEntity({ entityData }, { config }) {
  // it is in fact defined in the prop types :/
  // eslint-disable-next-line react/prop-types
  const { __typename } = entityData;

  if (__typename === 'Route') {
    const { mode, color, shortName } = entityData;
    return (
      <RouteNumber
        mode={mode}
        color={color}
        text={shortName}
        // TODO `card`?
        // TODO `withBar`?
        // TODO `icon`
      />
    );
  }
  if (__typename === 'RouteType') {
    const { routeType } = entityData;
    // TODO what if this fails?
    const mode = typeToName[routeType];
    if (!mode) {
      return <span>?</span>;
    }
    return <Icon img={`icon-icon_${mode}`} ariaLabel={`${mode} icon`} />;
  }
  if (__typename === 'Stop') {
    const { vehicleMode } = entityData;
    const mode = vehicleMode.toLowerCase();
    return (
      <Icon
        img={`icon-icon_stop_${mode}`}
        color={
          config.colors.iconColors[`mode-${mode}`] || config.colors.primary
        }
        ariaLabel={`${mode} stop icon`}
      />
    );
  }
  // TODO Agency?
  return null;
}

export function Alert({ alertData }) {
  const {
    id,
    alertHeaderText,
    alertDescriptionText,
    effectiveStartDate,
    effectiveEndDate,
  } = alertData;
  const entities = Array.isArray(alertData.entities) ? alertData.entities : [];

  // eslint-disable-next-line no-underscore-dangle
  const affectsWholeAgency = entities.some(e => e.__typename === 'Agency');

  const start = effectiveStartDate ? (
    <time
      key="alert-start-date"
      className="alerts-view-alert-start-date"
      dateTime={new Date(effectiveStartDate).toISOString()}
    >
      {localizeDate(effectiveStartDate)}
    </time>
  ) : null;
  const end = effectiveEndDate ? (
    <time
      key="alert-end-date"
      className="alerts-view-alert-end-date"
      dateTime={new Date(effectiveEndDate).toISOString()}
    >
      {localizeDate(effectiveEndDate)}
    </time>
  ) : null;
  const startEnd = start && end ? [start, ' – ', end] : [start, end];

  return (
    <div
      id={id}
      className={cx('alerts-view-alert', {
        'general-notice': affectsWholeAgency,
      })}
    >
      <div className="alerts-view-alert-entities">
        {entities.map(entityData => (
          <AlertEntity key={entityData.id} entityData={entityData} />
        ))}
      </div>
      {/* todo: i18n, proper fallback heading */}
      <h3>{alertHeaderText || 'notice'}</h3>
      <p className="alerts-view-alert-time-frame">{startEnd}</p>
      <p>{alertDescriptionText}</p>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
export default function AlertsView(props) {
  // todo: don't mock data anymore
  // const {alerts} = props;
  // id
  // # alertId
  // alertHeaderText
  // alertDescriptionText
  // effectiveStartDate
  // effectiveEndDate
  // entities {
  //   ...on Route {
  //     id
  //     gtfsId
  //     shortName
  //     # longName(language: $language)
  //     mode
  //     color
  //   }
  //   ...on Stop {
  //     id
  //     gtfsId
  //     code
  //     # name(language: $language)
  //     vehicleMode
  //   }
  //   ...on Agency {
  //     id
  //     name
  //     url
  //   }
  //   ...on RouteType {
  //     id
  //     routeType
  //   }
  //   # todo: how to handle others?
  // }
  // eslint-disable-next-line no-underscore-dangle
  const _mockAlerts = [
    {
      id: 'epofkewpofkwek',
      alertHeaderText: 'everything is burning',
      alertDescriptionText:
        'literally everything broke down. sorry. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Elementum nibh.',
      effectiveStartDate: Date.parse('2023-01-27T10:10-06:00'),
      effectiveEndDate: Date.parse('2023-02-10T00:00-06:00'),
      entities: [
        {
          // eslint-disable-next-line no-underscore-dangle
          __typename: 'Agency',
          id: 'wqpdowhefoewfnhewoifjf',
          name: 'Embark',
          url: 'https://embarkok.com/',
        },
      ],
    },
    {
      id: 'eoifjqfoij',
      alertHeaderText: 'strikes affecting all bus routes',
      alertDescriptionText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Elementum nibh tellus molestie nunc non blandit massa. Quam elementum.',
      effectiveStartDate: Date.parse('2023-02-04T00:00-06:00'),
      effectiveEndDate: Date.parse('2023-02-08T00:00-06:00'),
      entities: [
        {
          // eslint-disable-next-line no-underscore-dangle
          __typename: 'RouteType',
          id: 'ewoifjeoijfoij',
          routeType: 3,
        },
      ],
    },
    {
      id: 'cwqdjonoiwww',
      alertHeaderText: 'construction on 123',
      alertDescriptionText:
        'it also affects stop 1234. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Elementum nibh tellus molestie nunc non blandit massa. Quam elementum pulvinar etiam non quam lacus suspendisse faucibus interdum. Pellentesque elit eget gravida cum sociis natoque penatibus et magnis.',
      effectiveStartDate: Date.parse('2023-01-27T10:10-06:00'),
      effectiveEndDate: Date.parse('2023-02-10T00:00-06:00'),
      entities: [
        {
          // eslint-disable-next-line no-underscore-dangle
          __typename: 'Route',
          id: 'podkspdkqpdokq',
          gtfsId: 'route-123',
          shortName: '123',
          longName: 'one Two thrEE',
          mode: 'BUS',
          color: '$ff0000',
        },
        {
          // eslint-disable-next-line no-underscore-dangle
          __typename: 'Stop',
          id: 'sdjwpddpqdp',
          gtfsId: 'stop-abc',
          code: '1234',
          vehicleMode: 'BUS',
        },
      ],
    },
    {
      id: 'poifi23oirn',
      alertHeaderText: 'stop closed because of a concert',
      alertDescriptionText: 'woohoooo',
      effectiveStartDate: Date.parse('2023-02-02T00:00-06:00'),
      effectiveEndDate: Date.parse('2023-02-03T00:00-06:00'),
      entities: [
        {
          // eslint-disable-next-line no-underscore-dangle
          __typename: 'Stop',
          id: 'p2oeijeoi3r3',
          gtfsId: 'stop-bcd',
          code: '2345',
          vehicleMode: 'TRAM',
        },
      ],
    },
  ];
  const alerts = _mockAlerts.sort(sortAlerts);

  return (
    <div className="alerts-view">
      <section>{/* {todo: filter UI} */}</section>
      <section>
        {alerts.map(alertData => (
          <Alert key={alertData.id} alertData={alertData} />
        ))}
      </section>
    </div>
  );
}

// eslint-disable-next-line no-underscore-dangle
const _AlertEntityPropTypes = {
  __typename: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
const RoutePropTypes = PropTypes.shape({
  ..._AlertEntityPropTypes,
  gtfsId: PropTypes.string.isRequired,
  shortName: PropTypes.string,
  // longName: PropTypes.string,
  mode: PropTypes.oneOf(Object.values(TransportMode)),
  color: PropTypes.string,
});
const StopPropTypes = PropTypes.shape({
  ..._AlertEntityPropTypes,
  gtfsId: PropTypes.string.isRequired,
  code: PropTypes.string,
  // name: PropTypes.string,
  vehicleMode: PropTypes.oneOf(Object.values(TransportMode)),
});
const AgencyPropTypes = PropTypes.shape({
  ..._AlertEntityPropTypes,
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
});
const RouteTypePropTypes = PropTypes.shape({
  ..._AlertEntityPropTypes,
  routeType: PropTypes.number.isRequired,
});
const AlertEntityPropType = PropTypes.oneOfType([
  RoutePropTypes,
  StopPropTypes,
  AgencyPropTypes,
  RouteTypePropTypes,
]);

AlertEntity.propTypes = {
  entityData: AlertEntityPropType.isRequired,
};
AlertEntity.contextTypes = {
  config: PropTypes.object.isRequired,
};

const AlertPropTypes = PropTypes.shape({
  id: PropTypes.string.isRequired,
  // alertId
  alertHeaderText: PropTypes.string,
  alertDescriptionText: PropTypes.string.isRequired,
  effectiveStartDate: PropTypes.number,
  effectiveEndDate: PropTypes.number,
  entities: PropTypes.arrayOf(AlertEntityPropType),
});

Alert.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  alertData: AlertPropTypes.isRequired,
};

AlertsView.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  alerts: PropTypes.arrayOf(AlertPropTypes).isRequired,
};

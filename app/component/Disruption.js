import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'found';
import { useIntl } from 'react-intl';
import { DateTime } from 'luxon';
import cx from 'classnames';
import Icon from './Icon';
import DisruptionBadge from './trafficnow/DisruptionBadge';
import { useConfigContext } from '../configurations/ConfigContext';
import { routePagePath, stopPagePath } from '../util/path';
import IconBackground from './icon/IconBackground';
import { getRouteMode } from '../util/modeUtils';
import { getStartTimeWithColon } from '../util/timeUtils';
import { entityShape, stopTimeShape } from '../util/shapes';
import {
  AlertEntityType,
  AlertSeverityLevelType,
  LocationTypes,
} from '../constants';

export default function Disruption({
  toggleDetails,
  alertDescriptionText,
  alertEffect = '',
  entities = [],
  alertHeaderText,
  alertSeverityLevel = AlertSeverityLevelType.Unknown,
  canceledDepartures = [],
  effectiveStartDate,
}) {
  const config = useConfigContext();
  const { match } = useRouter();
  const intl = useIntl();
  const hasCancelations = canceledDepartures.length > 0;

  if (!alertDescriptionText && !alertHeaderText) {
    return null;
  }

  // group entities by type and mode, used to display badges
  const groupedEntities = useMemo(
    () =>
      entities.reduce((acc, entity) => {
        // eslint-disable-next-line no-underscore-dangle
        const typename = entity.__typename;
        const mode = entity.mode
          ? getRouteMode(entity, config)
          : (entity.vehicleMode || 'bus').toLowerCase();
        const key = `${typename}_${mode}`;
        if (!acc[key]) {
          // eslint-disable-next-line no-param-reassign
          acc[key] = { typename, mode, items: [] };
        }
        acc[key].items.push(entity);
        return acc;
      }, {}),
    [entities],
  );

  // if startDate not defined, assume the alert is active
  const active =
    !effectiveStartDate || effectiveStartDate <= DateTime.now().toSeconds();
  // show status or date of cancelations
  const status = hasCancelations && (
    <span className="disruption-status">
      <Icon img={active ? 'icon_status' : 'icon_calendar'} />
      <span className="disruption-status-date">
        {active
          ? intl.formatMessage({ id: 'disruption-list-active' })
          : DateTime.fromSeconds(effectiveStartDate).toFormat('ccc d.L.')}
      </span>
    </span>
  );

  const buttonLabel = hasCancelations
    ? intl.formatMessage({
        id: 'disruption-view-timetable',
        defaultMessage: 'View timetable',
      })
    : intl.formatMessage({
        id: 'disruption-view-details',
        defaultMessage: 'View details',
      });
  return (
    <div className="alert-row-container" role="listitem">
      <div
        className="alert-row"
        role="button"
        aria-label={alertDescriptionText}
        onClick={toggleDetails}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === ' ' || e.key === 'Enter') {
            if (toggleDetails) {
              toggleDetails();
            }
            e.stopPropagation();
          }
        }}
      >
        {toggleDetails && (
          <button
            type="button"
            onClick={e => {
              if (toggleDetails) {
                toggleDetails();
              }
              e.stopPropagation();
            }}
            className="alert-row-arrow"
            aria-label={buttonLabel}
          >
            <Icon
              img="icon_arrow-collapse--right"
              color={config.colors.primary}
            />
          </button>
        )}
        <div className="alert-row-top">
          <DisruptionBadge
            showIcon
            variant={alertSeverityLevel}
            label={alertEffect || 'no_service'}
          />
          {status}
        </div>
        <div className="alert-row-badges">
          {groupedEntities &&
            Object.entries(groupedEntities).map(
              ([key, { typename, mode, items }]) => {
                const isStop = typename === AlertEntityType.Stop;
                return (
                  <Fragment key={key}>
                    <Icon
                      img={`icon_${
                        mode.toLowerCase() === 'bus-express'
                          ? 'bus'
                          : mode.toLowerCase()
                      }`}
                      className={`${mode.toLowerCase()}`}
                      height={2.15}
                      width={2.15}
                      iconScale={isStop ? 0.5 : 1}
                      background={
                        isStop && (
                          <IconBackground
                            shape="stopsign"
                            color="currentcolor"
                          />
                        )
                      }
                    />
                    {items.map(({ gtfsId, shortName, name, locationType }) => {
                      const isStation = locationType === LocationTypes.STATION;
                      return (
                        <span
                          key={gtfsId}
                          className={cx('mode-badge', mode.toLowerCase())}
                        >
                          <a
                            href={
                              isStop
                                ? stopPagePath(isStation, gtfsId)
                                : routePagePath(gtfsId)
                            }
                            onClick={e => {
                              e.preventDefault();
                              match.router.push(
                                isStop
                                  ? stopPagePath(isStation, gtfsId)
                                  : routePagePath(gtfsId),
                              );
                            }}
                          >
                            <span>{isStop ? name : shortName}</span>
                          </a>
                        </span>
                      );
                    })}
                  </Fragment>
                );
              },
            )}
        </div>
        <div className="alert-row-bottom">
          <span className="alert-row-title">{alertHeaderText}</span>
          {canceledDepartures.length > 0 && (
            <div className="canceled-departures">
              {canceledDepartures.map(st => (
                <span key={st.scheduledDeparture} className="cancelation-badge">
                  <span className="canceled">
                    {getStartTimeWithColon(st.scheduledDeparture)}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Disruption.propTypes = {
  toggleDetails: PropTypes.func,
  alertDescriptionText: PropTypes.string,
  alertEffect: PropTypes.string,
  entities: PropTypes.arrayOf(entityShape),
  alertSeverityLevel: PropTypes.string,
  alertHeaderText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  canceledDepartures: PropTypes.arrayOf(stopTimeShape),
  effectiveStartDate: PropTypes.number,
};

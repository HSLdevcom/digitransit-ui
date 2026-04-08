import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'found';
import Icon from './Icon';
import Badge from './Badge';
import { useConfigContext } from '../client/ConfigContext';
import { routePagePath, stopPagePath } from '../../utils/shared/path';
import IconBackground from './icon/IconBackground';
import { getRouteMode } from '../../utils/client/modeUtils';
import { getStartTimeWithColon } from '../../utils/client/timeUtils';
import { stopTimeShape } from '../../utils/client/shapes';
import { AlertEntityType, LocationTypes } from '../../utils/shared/constants';

export default function Disruption({
  toggleDetails,
  alertDescriptionText,
  alertEffect,
  entities,
  alertHeaderText,
  alertSeverityLevel,
  id,
  onClickLink,
  canceledStoptimes,
}) {
  const config = useConfigContext();
  const { match } = useRouter();
  const isCancelation = !!canceledStoptimes;

  if (!alertDescriptionText && !alertHeaderText) {
    return null;
  }
  const e = entities.reduce((acc, entity) => {
    // eslint-disable-next-line no-underscore-dangle
    const typename = entity.__typename;
    const mode = entity.mode
      ? getRouteMode(entity, config)
      : entity.vehicleMode.toLowerCase();
    const key = `${typename}_${mode}`;
    if (!acc[key]) {
      // eslint-disable-next-line no-param-reassign
      acc[key] = { typename, mode, items: [] };
    }
    acc[key].items.push(entity);
    return acc;
  }, {});

  return (
    <div className="alert-row" role="listitem">
      {!isCancelation && toggleDetails && (
        <button
          type="button"
          onClick={() => toggleDetails(id)}
          className="alert-row-arrow"
          // TODO: button label
        >
          <Icon
            img="icon_arrow-collapse--right"
            color={config.colors.primary}
          />
        </button>
      )}
      <div className="alert-row-top">
        <Badge
          showIcon
          variant={alertSeverityLevel}
          label={alertEffect ?? 'no_service'}
        />
      </div>
      <div className="alert-row-badges">
        {e &&
          Object.entries(e).map(([key, { typename, mode, items }]) => {
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
                  height={2}
                  width={2}
                  iconScale={isStop ? 0.5 : 1}
                  background={
                    isStop && (
                      <IconBackground shape="stopsign" color="currentcolor" />
                    )
                  }
                />
                {items.map(
                  ({ gtfsId, id: entityId, shortName, name, locationType }) => {
                    const isStation = locationType === LocationTypes.STATION;
                    return (
                      <span key={gtfsId} className="mode-badge">
                        <a
                          href={
                            isStop
                              ? stopPagePath(isStation, gtfsId)
                              : routePagePath(gtfsId)
                          }
                          key={entityId}
                          onClick={event => {
                            event.preventDefault();
                            onClickLink?.();
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
                  },
                )}
              </Fragment>
            );
          })}
      </div>
      <div className="alert-row-bottom">
        <span className="alert-row-title">{alertHeaderText}</span>
        {canceledStoptimes && (
          <div className="canceled-departures">
            {canceledStoptimes.map(st => (
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
  );
}

Disruption.propTypes = {
  toggleDetails: PropTypes.func,
  alertDescriptionText: PropTypes.string,
  alertEffect: PropTypes.string,
  entities: PropTypes.arrayOf(
    PropTypes.shape({
      __typename: PropTypes.string.isRequired,
      gtfsId: PropTypes.string.isRequired,
    }),
  ),
  alertSeverityLevel: PropTypes.string,
  alertHeaderText: PropTypes.string,
  id: PropTypes.string,
  onClickLink: PropTypes.func,
  canceledStoptimes: PropTypes.arrayOf(stopTimeShape),
};

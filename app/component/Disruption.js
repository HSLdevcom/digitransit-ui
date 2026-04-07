import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'found';
import Icon from './Icon';
import Badge from './Badge';
import { useConfigContext } from '../configurations/ConfigContext';
import { routePagePath, stopPagePath } from '../util/path';
import IconBackground from './icon/IconBackground';
import { getRouteMode } from '../util/modeUtils';

export default function Disruption({
  toggleDetails,
  alertDescriptionText,
  alertEffect,
  entities,
  alertHeaderText,
  alertSeverityLevel,
  id,
}) {
  const config = useConfigContext();
  const { match } = useRouter();

  if (!alertDescriptionText && !alertHeaderText) {
    return null;
  }
  const e = entities.reduce((acc, entity) => {
    // eslint-disable-next-line no-underscore-dangle
    const mode = entity.mode
      ? getRouteMode(entity, config)
      : entity.vehicleMode.toLowerCase();
    const modeEntities = acc[mode] ? [...acc[mode], entity] : [entity];
    return {
      ...acc,
      [mode]: modeEntities,
    };
  }, {});

  return (
    <div className="alert-row" role="listitem">
      {toggleDetails && (
        <button
          type="button"
          onClick={() => toggleDetails(id)}
          className="alert-row-arrow"
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
          Object.keys(e).map(mode => {
            if (mode === 'Stop') {
              return (
                <Fragment key={mode}>
                  <Icon
                    img={`icon_${e[mode][0].vehicleMode.toLowerCase()}`}
                    className={e[mode][0].vehicleMode.toLowerCase()}
                    height={2}
                    width={2}
                    iconScale={0.5}
                    background={
                      <IconBackground shape="stopsign" color="currentcolor" />
                    }
                  />

                  {e[mode].map(({ name, gtfsId }) => (
                    <span key={gtfsId} className="mode-badge">
                      <a href={stopPagePath(false, gtfsId)}>
                        <span>{name}</span>
                      </a>
                    </span>
                  ))}
                </Fragment>
              );
            }
            return (
              <Fragment key={`${mode}_badges`}>
                <Icon
                  img={`icon_${
                    mode.toLowerCase() === 'bus-express'
                      ? 'bus'
                      : mode.toLowerCase()
                  }`}
                  className={`${mode.toLowerCase()}`}
                  height={2}
                  width={2}
                />
                {e[mode].map(({ gtfsId, id: entityId, shortName: name }) => (
                  <span key={gtfsId} className="mode-badge">
                    <a
                      href={routePagePath(gtfsId)}
                      key={entityId}
                      onClick={event => {
                        event.preventDefault();
                        match.router.push(routePagePath(gtfsId));
                      }}
                    >
                      <span>{name}</span>
                    </a>
                  </span>
                ))}
              </Fragment>
            );
          })}
      </div>
      <div className="alert-row-bottom">
        <span className="alert-row-title">{alertHeaderText}</span>
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
};

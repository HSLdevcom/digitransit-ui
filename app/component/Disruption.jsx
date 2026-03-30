import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'found';
import Icon from './Icon';
import Badge from './Badge';
import { useConfigContext } from '../client/ConfigContext';
import { groupEntitiesByMode } from './trafficnow/utils';

export default function Disruption({
  toggleDetails,
  alertDescriptionText,
  alertEffect,
  entities,
  alertHeaderText,
  alertSeverityLevel,
  id,
  onClickLink,
}) {
  const config = useConfigContext();
  const { match } = useRouter();

  if (!alertDescriptionText && !alertHeaderText) {
    return null;
  }

  const entitiesByMode = groupEntitiesByMode(entities, config);
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
        <Badge showIcon variant={alertSeverityLevel} label={alertEffect} />
      </div>
      <div className="alert-row-badges">
        {Object.entries(entitiesByMode).map(
          ([modeKey, { mode, entities: modeEntities }]) => {
            return (
              <React.Fragment key={modeKey}>
                <Icon
                  img={`icon_${mode === 'bus-express' ? 'bus' : mode}`}
                  className={`${mode}`}
                  height={2}
                  width={2}
                />
                <span className="route-badge-lines">
                  {modeEntities.map(({ url, id: entityId, name }) => (
                    <a
                      href={url}
                      key={entityId}
                      onClick={e => {
                        e.preventDefault();
                        onClickLink?.();
                        match.router.push(url);
                      }}
                    >
                      <span>{name}</span>
                    </a>
                  ))}
                </span>
              </React.Fragment>
            );
          },
        )}
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
  onClickLink: PropTypes.func,
};

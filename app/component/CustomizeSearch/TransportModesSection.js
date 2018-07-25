import xor from 'lodash/xor';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { routerShape } from 'react-router';

import Checkbox from '../Checkbox';
import Icon from '../Icon';
import IconWithBigCaution from '../IconWithBigCaution';
import { isKeyboardSelectionEvent } from '../../util/browser';
import { getAvailableTransportModes, getModes } from '../../util/modeUtils';
import { replaceQueryParams } from '../../util/queryUtils';

const toggleTransportMode = (router, config, mode) => {
  const currentLocation = router.getCurrentLocation();
  const modes = xor(getModes(currentLocation, config), [
    mode.toUpperCase(),
  ]).join(',');
  replaceQueryParams(router, { modes });
};

const TransportModesSection = ({ config, currentModes }, { intl, router }) => {
  const isBikeRejected =
    currentModes.filter(o2 => o2 === 'BICYCLE' || o2 === 'BUS').length > 1;
  const transportModes = getAvailableTransportModes(config);

  return (
    <React.Fragment>
      <div className="transport-mode-header">
        <h1>
          {intl.formatMessage({
            id: 'public-transport',
            defaultMessage: 'Public Transport',
          })}
        </h1>
      </div>
      <div className="transport-mode-subheader">
        <FormattedMessage
          id="pick-mode"
          defaultMessage="Pick a transport mode"
        />
      </div>
      <div className="transport-modes-container">
        {transportModes.map(modeName => (
          <div
            className="mode-option-container"
            key={`mode-option-${modeName.toLowerCase()}`}
          >
            <Checkbox
              checked={currentModes.filter(o2 => o2 === modeName).length > 0}
              defaultMessage={modeName}
              labelId={modeName.toLowerCase()}
              onChange={() => toggleTransportMode(router, config, modeName)}
              showLabel={false}
            />
            <div
              role="button"
              tabIndex={0}
              aria-label={`${modeName.toLowerCase()}`}
              className={`mode-option-block ${modeName.toLowerCase()}`}
              onKeyPress={e =>
                isKeyboardSelectionEvent(e) &&
                toggleTransportMode(router, config, modeName)
              }
              onClick={() => toggleTransportMode(router, config, modeName)}
            >
              <div className="mode-icon">
                {isBikeRejected && modeName === 'BUS' ? (
                  <IconWithBigCaution
                    color="currentColor"
                    className={modeName.toLowerCase()}
                    img={`icon-icon_${modeName.toLowerCase()}`}
                  />
                ) : (
                  <Icon
                    className={`${modeName}-icon`}
                    img={`icon-icon_${modeName.toLowerCase()}`}
                  />
                )}
              </div>
              <div className="mode-name">
                <FormattedMessage
                  id={modeName.toLowerCase()}
                  defaultMessage={modeName.toLowerCase()}
                />
                {isBikeRejected &&
                  modeName === 'BUS' && (
                    <span className="span-bike-not-allowed">
                      {intl.formatMessage({
                        id: 'bike-not-allowed',
                        defaultMessage: 'Bikes are not allowed on the bus',
                      })}
                    </span>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
};

TransportModesSection.propTypes = {
  config: PropTypes.object.isRequired,
  currentModes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

TransportModesSection.contextTypes = {
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
};

export default TransportModesSection;

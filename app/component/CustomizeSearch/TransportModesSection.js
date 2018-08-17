import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { routerShape } from 'react-router';

import Checkbox from '../Checkbox';
import Icon from '../Icon';
import IconWithBigCaution from '../IconWithBigCaution';
import { isKeyboardSelectionEvent } from '../../util/browser';
import {
  getAvailableTransportModes,
  toggleTransportMode,
} from '../../util/modeUtils';

const TransportModesSection = ({ config, currentModes }, { intl, router }) => {
  const modesWithNoBike = ['BUS', 'TRAM'];
  const isUsingBike = currentModes && currentModes.includes('BICYCLE');
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
        {transportModes.map(mode => (
          <div
            className="mode-option-container"
            key={`mode-option-${mode.toLowerCase()}`}
          >
            <Checkbox
              checked={currentModes.filter(o2 => o2 === mode).length > 0}
              defaultMessage={mode}
              labelId={mode.toLowerCase()}
              onChange={() =>
                toggleTransportMode(mode, config, router, isUsingBike)
              }
              showLabel={false}
            />
            <div
              role="button"
              tabIndex={0}
              aria-label={`${mode.toLowerCase()}`}
              className={`mode-option-block ${mode.toLowerCase()}`}
              onKeyPress={e =>
                isKeyboardSelectionEvent(e) &&
                toggleTransportMode(mode, config, router, isUsingBike)
              }
              onClick={() =>
                toggleTransportMode(mode, config, router, isUsingBike)
              }
            >
              <div className="mode-icon">
                {isUsingBike && modesWithNoBike.includes(mode) ? (
                  <IconWithBigCaution
                    color="currentColor"
                    className={mode.toLowerCase()}
                    img={`icon-icon_${mode.toLowerCase()}`}
                  />
                ) : (
                  <Icon
                    className={`${mode}-icon`}
                    img={`icon-icon_${mode.toLowerCase()}`}
                  />
                )}
              </div>
              <div className="mode-name">
                <FormattedMessage
                  id={mode.toLowerCase()}
                  defaultMessage={mode.toLowerCase()}
                />
                {isUsingBike &&
                  modesWithNoBike.includes(mode) && (
                    <span className="span-bike-not-allowed">
                      {intl.formatMessage({
                        id: `bike-not-allowed-${mode.toLowerCase()}`,
                        defaultMessage: 'Bikes are not allowed on the vehicle',
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

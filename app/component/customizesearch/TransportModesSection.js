import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';

import cx from 'classnames';
import Checkbox from '../Checkbox';
import Icon from '../Icon';
import IconWithBigCaution from '../IconWithBigCaution';
import { isKeyboardSelectionEvent } from '../../util/browser';
import {
  getAvailableTransportModes,
  toggleTransportMode,
  isBikeRestricted,
} from '../../util/modeUtils';

const TransportModesSection = (
  { config, currentModes },
  { intl, router, match },
) => {
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
                !isBikeRestricted(match.location, config, mode) &&
                toggleTransportMode(mode, config, router, match)
              }
              showLabel={false}
            />
            <div
              role="button"
              tabIndex={0}
              aria-label={`${mode.toLowerCase()}`}
              className={cx([`mode-option-block`], mode.toLowerCase(), {
                disabled: !currentModes.includes(mode),
              })}
              onKeyPress={e =>
                isKeyboardSelectionEvent(e) &&
                !isBikeRestricted(match.location, config, mode) &&
                toggleTransportMode(mode, config, router, match)
              }
              onClick={() =>
                !isBikeRestricted(match.location, config, mode) &&
                toggleTransportMode(mode, config, router, match)
              }
            >
              <div className="mode-icon">
                {isBikeRestricted(match.location, config, mode) ? (
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
                {isBikeRestricted(match.location, config, mode) && (
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
  match: matchShape.isRequired,
};

export default TransportModesSection;

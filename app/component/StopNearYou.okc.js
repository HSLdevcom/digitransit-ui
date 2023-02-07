import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import { Link } from 'found';
import { PREFIX_STOPS, PREFIX_TERMINALS } from '../util/path';

import StopCode from './StopCode';
// todo: use app/component/Icon.js instead?
// import Icon from '@digitransit-component/digitransit-component-icon';
import Icon from './Icon';

const StopNearYou = ({ stop, stopId }, { config, intl }) => {
  const stopOrStation = stop.parentStation ? stop.parentStation : stop;
  // todo: this is very brittle
  const mode = stopOrStation.stoptimesWithoutPatterns[0]?.trip.route.mode?.toLowerCase();
  const isStation = !!stop.parentStation || !!stopId;
  const gtfsId =
    (stop.parentStation && stop.parentStation.gtfsId) || stop.gtfsId;
  const linkAddress = isStation
    ? `/${PREFIX_TERMINALS}/${gtfsId}`
    : `/${PREFIX_STOPS}/${gtfsId}`;

  return (
    <span role="listitem">
      <div className="stop-near-you-container">
        <Link
          // todo: `as: 'div'`?
          to={linkAddress}
        >
          <div className="stop-near-you-inner-container">
            <div className="stop-near-you-left-col">
              <span className={mode}>
                {/* <Icon color={config.colors.iconColors[mode]} img={`${mode}-stop`} /> */}
                <Icon
                  color={config.colors.iconColors[mode]}
                  img={`icon-icon_${mode}-stop`}
                  width={2}
                  height={2}
                  ariaLabel={intl.formatMessage({ id: mode })}
                />
              </span>
              <div>
                <StopCode code={stop.code} />
              </div>
            </div>
            <div className="stop-near-you-right-col">
              <h3 className="stop-near-you-name">
                {stop.name}
                {/* todo: arrow icon */}
                {/* <Icon img={`icon-icon_todo`} /> */}
              </h3>
            </div>
          </div>
        </Link>
      </div>
    </span>
  );
};

StopNearYou.propTypes = {
  stop: PropTypes.object.isRequired,
  stopId: PropTypes.string,
};

StopNearYou.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default StopNearYou;

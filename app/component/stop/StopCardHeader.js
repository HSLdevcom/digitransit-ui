import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useRouter } from 'found';
import { stopShape, stationShape } from '../../util/shapes';
import CardHeader from '../CardHeader';
import { getJson } from '../../util/xhrPromise';
import { saveSearch } from '../../action/SearchActions';
import { isIOS } from '../../util/browser';
import FavouriteStopContainer from '../FavouriteStopContainer';
import { useConfigContext } from '../../configurations/ConfigContext';

function StopCardHeader(
  {
    stop,
    distance,
    className,
    headingStyle,
    icons,
    isPopUp = false,
    breakpoint,
    isTerminal = false,
  },
  { executeAction },
) {
  const config = useConfigContext();
  const { match } = useRouter();
  const headerConfig = config.stopCard?.header || {};

  useEffect(() => {
    if (!isIOS || !stop || isPopUp || !match.location.query?.save) {
      return;
    }
    const layer = isTerminal ? 'station' : 'stop';
    let id = `GTFS:${stop.gtfsId}`;
    let { name } = stop;
    if (stop.code) {
      id = `${id}#${stop.code}`;
      name = `${name} ${stop.code}`;
    }

    const searchParams = {
      'point.lat': stop.lat,
      'point.lon': stop.lon,
      'boundary.circle.radius': 0.2,
      size: 1,
    };
    if (config.searchParams?.['boundary.country']) {
      searchParams['boundary.country'] =
        config.searchParams['boundary.country'];
    }

    getJson(config.URL.PELIAS_REVERSE_GEOCODER, searchParams)
      .then(data => {
        if (data.features != null && data.features.length > 0) {
          const feat = data.features[0].properties;
          const city = feat.localadmin;

          executeAction(saveSearch, {
            item: {
              geometry: { coordinates: [stop.lon, stop.lat] },
              properties: {
                name,
                id,
                gid: `gtfs:${layer}:${id}`,
                layer,
                label: `${stop.name}, ${city}`,
                localadmin: city,
              },
              type: 'Feature',
            },
            type: 'endpoint',
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!stop) {
    return false;
  }

  const getDescription = () => {
    let desc = '';
    if (headerConfig.showDescription && stop.desc) {
      desc += stop.desc;
    }
    if (headerConfig.showDistance && distance) {
      desc += ` // ${Math.round(distance)} m`;
    }
    if (isTerminal && stop.stops) {
      desc = stop.stops[0].desc;
    }
    return desc;
  };

  return (
    <CardHeader
      className={className}
      headingStyle={headingStyle}
      description={getDescription()}
      code={headerConfig.showStopCode && stop.code ? stop.code : null}
      icons={icons}
      showBackButton={breakpoint === 'large'}
      stop={stop}
      isTerminal={isTerminal}
      favouriteContainer={
        <FavouriteStopContainer stop={stop} isTerminal={isTerminal} />
      }
    />
  );
}

StopCardHeader.propTypes = {
  stop: PropTypes.oneOfType([stopShape, stationShape]),
  distance: PropTypes.number,
  className: PropTypes.string,
  headingStyle: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
  isPopUp: PropTypes.bool,
  breakpoint: PropTypes.string,
  isTerminal: PropTypes.bool,
};

// executeAction stays on legacy contextTypes until Fluxible is replaced with React context / or executeAction is moved to react context.
StopCardHeader.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

StopCardHeader.displayName = 'StopCardHeader';

export default StopCardHeader;

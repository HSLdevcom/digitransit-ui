import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape } from 'found';
import CardHeader from './CardHeader';
import { getJson } from '../util/xhrPromise';
import { saveSearch } from '../action/SearchActions';
import { isIOS } from '../util/browser';
/* import LazilyLoad, { importLazy } from './LazilyLoad';

const modules = {
  FavouriteStopContainer: () => importLazy(import('./FavouriteStopContainer')),
}; */

class StopCardHeader extends React.Component {
  componentDidMount() {
    // update localStorage searches if necessary
    const { stop, isPopUp } = this.props;
    if (!isIOS || !stop || isPopUp || !this.context.match.location.query.save) {
      return;
    }
    const layer = this.props.isTerminal ? 'station' : 'stop';
    let id = `GTFS:${stop.gtfsId}`;
    let { name } = stop;
    if (stop.code) {
      id = `${id}#${stop.code}`;
      name = `${name} ${stop.code}`;
    }

    getJson(this.context.config.URL.PELIAS_REVERSE_GEOCODER, {
      'point.lat': stop.lat,
      'point.lon': stop.lon,
      'boundary.circle.radius': 0.2,
      size: 1,
    }).then(data => {
      if (data.features != null && data.features.length > 0) {
        const match = data.features[0].properties;
        const city = match.localadmin;

        this.context.executeAction(saveSearch, {
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
    });
  }

  get headerConfig() {
    return this.context.config.stopCard.header;
  }

  getDescription() {
    let description = '';

    if (this.headerConfig.showDescription && this.props.stop.desc) {
      description += this.props.stop.desc;
    }

    if (this.headerConfig.showDistance && this.props.distance) {
      description += ` // ${Math.round(this.props.distance)} m`;
    }

    if (this.props.isTerminal && this.props.stop.stops) {
      description = this.props.stop.stops[0].desc;
    }

    return description;
  }

  render() {
    const {
      className,
      headingStyle,
      icons,
      stop,
      breakpoint, // DT-3472
      isTerminal,
    } = this.props;
    if (!stop) {
      return false;
    }

    return (
      <CardHeader
        className={className}
        headingStyle={headingStyle}
        description={this.getDescription()}
        code={this.headerConfig.showStopCode && stop.code ? stop.code : null}
        icons={icons}
        showBackButton={breakpoint === 'large'}
        stop={stop}
        headerConfig={this.headerConfig}
        isTerminal={isTerminal}
        showHeaderTitle
        showCardSubHeader
        // TODO: Fix places geocoder api request to reimplement favorite button.
        // https://github.com/stadtnavi/digitransit-ui/issues/481
        /** favouriteContainer={
          <LazilyLoad modules={modules}>
            {({ FavouriteStopContainer }) => (
              <FavouriteStopContainer stop={stop} isTerminal={isTerminal} />
            )}
          </LazilyLoad>
        } */
      />
    );
  }
}

StopCardHeader.propTypes = {
  stop: PropTypes.shape({
    gtfsId: PropTypes.string,
    name: PropTypes.string,
    code: PropTypes.string,
    desc: PropTypes.string,
    isPopUp: PropTypes.bool,
    zoneId: PropTypes.string,
    stops: PropTypes.arrayOf(
      PropTypes.shape({
        desc: PropTypes.string,
      }),
    ),
    alerts: PropTypes.arrayOf(
      PropTypes.shape({
        alertSeverityLevel: PropTypes.string,
        effectiveEndDate: PropTypes.number,
        effectiveStartDate: PropTypes.number,
      }),
    ),
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  distance: PropTypes.number,
  className: PropTypes.string,
  headingStyle: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
  isPopUp: PropTypes.bool,
  breakpoint: PropTypes.string, // DT-3472
  isTerminal: PropTypes.bool,
};

StopCardHeader.defaultProps = {
  stop: undefined,
  isTerminal: false,
};

StopCardHeader.contextTypes = {
  config: PropTypes.shape({
    stopCard: PropTypes.shape({
      header: PropTypes.shape({
        showDescription: PropTypes.bool,
        showDistance: PropTypes.bool,
        showStopCode: PropTypes.bool,
        virtualMonitorBaseUrl: PropTypes.string,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
  match: matchShape.isRequired,
};

StopCardHeader.displayName = 'StopCardHeader';

export default StopCardHeader;

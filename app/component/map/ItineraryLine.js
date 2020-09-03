import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */

import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import polyUtil from 'polyline-encoded';
import get from 'lodash/get';

import StopMarker from './non-tile-layer/StopMarker';
import LegMarker from './non-tile-layer/LegMarker';
import Line from './Line';
import Icon from '../Icon';
import CityBikeMarker from './non-tile-layer/CityBikeMarker';
import { getMiddleOf } from '../../util/geo-utils';
import { isBrowser } from '../../util/browser';
import { isCallAgencyPickupType } from '../../util/legUtils';
import IconMarker from './IconMarker';
import SpeechBubble from './SpeechBubble';
import { durationToString } from '../../util/timeUtils';

const getLegText = (leg, config) => {
  if (!leg.route) {
    return '';
  }
  const showAgency = get(config, 'agency.show', false);
  if (leg.transitLeg && leg.route.shortName) {
    return leg.route.shortName;
  }
  if (showAgency && leg.route.agency) {
    return leg.route.agency.name;
  }
  return '';
};

class ItineraryLine extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    legs: PropTypes.array,
    passive: PropTypes.bool,
    hash: PropTypes.number,
    showTransferLabels: PropTypes.bool,
    showIntermediateStops: PropTypes.bool,
    streetMode: PropTypes.string,
  };

  checkStreetMode(leg) {
    if (this.props.streetMode === 'walk') {
      return leg.mode === 'WALK';
    }
    if (this.props.streetMode === 'bike') {
      return leg.mode === 'BICYCLE';
    }
    return false;
  }

  render() {
    if (!isBrowser) {
      return false;
    }

    const objs = [];
    this.props.legs.forEach((leg, i) => {
      if (leg.mode === 'WAIT') {
        return;
      }

      let { mode } = leg;

      if (leg.rentedBike && leg.mode !== 'WALK') {
        mode = 'CITYBIKE';
      }

      const modePlusClass =
        mode.toLowerCase() + (this.props.passive ? ' passive' : '');

      const geometry = polyUtil.decode(leg.legGeometry.points);
      const middle = getMiddleOf(geometry);

      objs.push(
        <Line
          color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
          key={`${this.props.hash}_${i}_${mode}`}
          geometry={geometry}
          mode={isCallAgencyPickupType(leg) ? 'call' : mode.toLowerCase()}
          passive={this.props.passive}
        />,
      );

      if (this.checkStreetMode(leg)) {
        const duration = durationToString(leg.endTime - leg.startTime);
        objs.push(
          <SpeechBubble
            key={`speech_${this.props.hash}_${i}_${mode}`}
            position={middle}
            text={duration}
          />,
        );
      }

      if (!this.props.passive) {
        if (
          this.props.showIntermediateStops &&
          leg.intermediatePlaces != null
        ) {
          leg.intermediatePlaces
            .filter(place => place.stop)
            .forEach(place =>
              objs.push(
                <StopMarker
                  disableModeIcons
                  stop={place.stop}
                  key={`intermediate-${place.stop.gtfsId}`}
                  mode={modePlusClass}
                  thin
                />,
              ),
            );
        }

        if (leg.from.vertexType === 'BIKESHARE') {
          objs.push(
            <CityBikeMarker
              key={leg.from.bikeRentalStation.stationId}
              showBikeAvailability={leg.rentedBike}
              station={leg.from.bikeRentalStation}
              transit
            />,
          );
        } else if (leg.transitLeg) {
          const name = getLegText(leg, this.context.config);
          if (isCallAgencyPickupType(leg)) {
            objs.push(
              <IconMarker
                key="call"
                position={{
                  lat: middle.lat,
                  lon: middle.lon,
                }}
                className="call"
                icon={{
                  element: <Icon img="icon-icon_call" />,
                  iconAnchor: [9, 9],
                  iconSize: [18, 18],
                  className: 'call',
                }}
              />,
            );
          } else {
            objs.push(
              <LegMarker
                key={`${i},${leg.mode}legmarker`}
                disableModeIcons
                renderName
                color={
                  leg.route && leg.route.color ? `#${leg.route.color}` : null
                }
                leg={{
                  from: leg.from,
                  to: leg.to,
                  lat: middle.lat,
                  lon: middle.lon,
                  name,
                  gtfsId: leg.from.stop.gtfsId,
                  code: leg.from.stop.code,
                }}
                mode={mode.toLowerCase()}
                zIndexOffset={300} // Make sure the LegMarker always stays above the StopMarkers
              />,
            );

            objs.push(
              <StopMarker
                key={`${i},${leg.mode}marker,from`}
                disableModeIcons
                stop={{
                  ...leg.from,
                  gtfsId: leg.from.stop.gtfsId,
                  code: leg.from.stop.code,
                  platformCode: leg.from.stop.platformCode,
                  transfer: true,
                }}
                mode={mode.toLowerCase()}
                renderText={leg.transitLeg && this.props.showTransferLabels}
              />,
            );
            objs.push(
              <StopMarker
                key={`${i},${leg.mode}marker,to`}
                disableModeIcons
                stop={{
                  ...leg.to,
                  gtfsId: leg.to.stop.gtfsId,
                  code: leg.to.stop.code,
                  platformCode: leg.to.stop.platformCode,
                  transfer: true,
                }}
                mode={mode.toLowerCase()}
                renderText={leg.transitLeg && this.props.showTransferLabels}
              />,
            );
          }
        }
      }
    });

    return <div style={{ display: 'none' }}>{objs}</div>;
  }
}

export default createFragmentContainer(ItineraryLine, {
  legs: graphql`
    fragment ItineraryLine_legs on Leg @relay(plural: true) {
      mode
      rentedBike
      startTime
      endTime
      legGeometry {
        points
      }
      transitLeg
      route {
        shortName
        color
        agency {
          name
        }
      }
      from {
        lat
        lon
        name
        vertexType
        bikeRentalStation {
          lat
          lon
          stationId
          networks
          bikesAvailable
        }
        stop {
          gtfsId
          code
          platformCode
        }
      }
      to {
        lat
        lon
        name
        vertexType
        bikeRentalStation {
          lat
          lon
          stationId
          networks
          bikesAvailable
        }
        stop {
          gtfsId
          code
          platformCode
        }
      }
      trip {
        stoptimes {
          stop {
            gtfsId
          }
          pickupType
        }
      }
      intermediatePlaces {
        arrivalTime
        stop {
          gtfsId
          lat
          lon
          name
          code
          platformCode
        }
      }
    }
  `,
});

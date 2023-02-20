import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */

import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import polyUtil from 'polyline-encoded';
import { intlShape } from 'react-intl';
import { getRouteMode } from '../../util/modeUtils';
import StopMarker from './non-tile-layer/StopMarker';
import Line from './Line';
import Icon from '../Icon';
import CityBikeMarker from './non-tile-layer/CityBikeMarker';
import { getMiddleOf } from '../../util/geo-utils';
import { isBrowser } from '../../util/browser';
import {
  isCallAgencyPickupType,
  getLegText,
  getInterliningLegs,
} from '../../util/legUtils';
import IconMarker from './IconMarker';
import SpeechBubble from './SpeechBubble';
import { durationToString } from '../../util/timeUtils';
import TransitLegMarkers from './non-tile-layer/TransitLegMarkers';

class ItineraryLine extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    legs: PropTypes.array,
    passive: PropTypes.bool,
    hash: PropTypes.number,
    showTransferLabels: PropTypes.bool,
    showIntermediateStops: PropTypes.bool,
    streetMode: PropTypes.string,
    onlyHasWalkingItineraries: PropTypes.bool,
    loading: PropTypes.bool,
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
    const transitLegs = [];

    this.props.legs.forEach((leg, i) => {
      if (!leg || leg.mode === 'WAIT') {
        return;
      }
      const nextLeg = this.props.legs[i + 1];

      let mode = getRouteMode({ mode: leg.mode, type: leg.route?.type });

      const [interliningLines, interliningLegs] = getInterliningLegs(
        this.props.legs,
        i,
      );

      const interliningWithRoute = interliningLines.join(' / ');

      if (leg.rentedBike && leg.mode !== 'WALK') {
        mode = 'CITYBIKE';
      }

      const modePlusClass =
        mode.toLowerCase() + (this.props.passive ? ' passive' : '');

      const geometry = polyUtil.decode(leg.legGeometry.points);
      let middle = getMiddleOf(geometry);

      if (interliningLegs.length > 0) {
        // merge the geometries of legs where user can wait in the vehicle and find the middle point
        // of the new geometry
        const points = interliningLegs
          .map(iLeg => polyUtil.decode(iLeg.legGeometry.points))
          .flat();
        const interlinedGeometry = [...geometry, ...points];
        middle = getMiddleOf(interlinedGeometry);
      }

      objs.push(
        <Line
          color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
          key={`${this.props.hash}_${i}_${mode}`}
          geometry={geometry}
          mode={isCallAgencyPickupType(leg) ? 'call' : mode.toLowerCase()}
          passive={this.props.passive}
        />,
      );

      if (
        (this.props.onlyHasWalkingItineraries && !this.props.loading) ||
        (this.checkStreetMode(leg) && leg.distance > 100)
      ) {
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
                  limitZoom={14}
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
              showBikeAvailability={leg.mode === 'BICYCLE'}
              station={leg.from.bikeRentalStation}
              transit
            />,
          );
        } else if (leg.transitLeg) {
          const name = getLegText(
            leg.route,
            this.context.config,
            interliningWithRoute,
          );
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
                  element: <Icon img="icon-icon_call" viewBox="0 0 51 51" />,
                  iconAnchor: [9, 9],
                  iconSize: [18, 18],
                  className: 'call',
                }}
              />,
            );
          } else {
            if (!leg?.interlineWithPreviousLeg) {
              transitLegs.push({
                ...leg,
                nextLeg,
                index: i,
                mode: mode.toLowerCase(),
                legName: name,
                zIndexOffset: 300,
                interliningWithRoute,
              });
            }
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

    // Add dynamic transit leg and transfer stop markers
    if (!this.props.passive) {
      objs.push(<TransitLegMarkers transitLegs={transitLegs} />);
    }

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
      distance
      legGeometry {
        points
      }
      transitLeg
      interlineWithPreviousLeg
      route {
        shortName
        color
        type
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

import PropTypes from 'prop-types';
import React from 'react';
import { withLeaflet } from 'react-leaflet/es/context';
import polyUtil from 'polyline-encoded';

import { intlShape } from 'react-intl';
import { isBrowser } from '../../../util/browser';
import { getMiddleOf } from '../../../util/geo-utils';
import LegMarker from './LegMarker';
import SpeechBubble from '../SpeechBubble';

const offsetNormal = { x: 22.5, y: 0 };
const offsetArrow = { x: 55, y: 15 };
const offsetSpeechBubble = { x: 15, y: 40 };
const minDistanceToShow = 64;

class TransitLegMarkers extends React.Component {
  static propTypes = {
    transitLegs: PropTypes.array.isRequired,
    leaflet: PropTypes.shape({
      map: PropTypes.shape({
        latLngToLayerPoint: PropTypes.func.isRequired,
        on: PropTypes.func.isRequired,
        off: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  getLegMarkerPixelPosition(leg) {
    const { map } = this.props.leaflet;
    const p1 = map.latLngToLayerPoint(leg.from);
    const p2 = map.latLngToLayerPoint(leg.to);
    const middle = getMiddleOf(polyUtil.decode(leg.legGeometry.points));
    const leafletPixelPosition = {
      ...map.latLngToLayerPoint({ lat: middle.lat, lon: middle.lon }),
      width: 45,
      height: 15,
    };
    let offset;
    let type;
    if (p1.distanceTo(p2) < minDistanceToShow) {
      offset = offsetArrow;
      type = 'arrow';
    } else {
      offset = offsetNormal;
      type = 'regular';
    }
    const truePixelPosition = {
      topLeft: {
        x: leafletPixelPosition.x - offset.x,
        y: leafletPixelPosition.y + offset.y,
      },
      bottomRight: {
        x: leafletPixelPosition.x - offset.x + leafletPixelPosition.width,
        y: leafletPixelPosition.y + offset.y + leafletPixelPosition.height,
      },
      type,
      middle,
      width: leafletPixelPosition.width,
      height: leafletPixelPosition.height,
    };
    return truePixelPosition;
  }

  getArrowMarkerStyle(leg, pixelPositions) {
    // Initial style is bottomLeft, try that
    const proposedPosition = {
      topLeft: leg.topLeft,
      bottomRight: leg.bottomRight,
      width: leg.width,
      height: leg.height,
    };
    // The area used to calculate overlaps excludes the arrow part for simplicity. This offset x and y are caused by the area that the arrow takes
    const arrowOffset = { x: 10, y: 12 };
    if (pixelPositions.length === 0) {
      return { style: 'bottomLeft', pixelPosition: proposedPosition };
    }
    let overlap = this.doMarkersOverlap(proposedPosition, pixelPositions);
    if (!overlap) {
      return { style: 'bottomLeft', pixelPosition: proposedPosition };
    }
    proposedPosition.topLeft.x =
      proposedPosition.topLeft.x + proposedPosition.width + 2 * arrowOffset.x;
    proposedPosition.bottomRight.x =
      proposedPosition.bottomRight.x +
      proposedPosition.width +
      2 * arrowOffset.x;
    overlap = this.doMarkersOverlap(proposedPosition, pixelPositions);
    if (!overlap) {
      return { style: 'bottomRight', pixelPosition: proposedPosition };
    }
    proposedPosition.topLeft.y =
      proposedPosition.topLeft.y - proposedPosition.height - 2 * arrowOffset.y;
    proposedPosition.bottomRight.y =
      proposedPosition.bottomRight.y -
      proposedPosition.height -
      2 * arrowOffset.y;
    overlap = this.doMarkersOverlap(proposedPosition, pixelPositions);
    if (!overlap) {
      return { style: 'topRight', pixelPosition: proposedPosition };
    }
    proposedPosition.topLeft.x =
      proposedPosition.topLeft.x - proposedPosition.width - 2 * arrowOffset.x;
    proposedPosition.bottomRight.x =
      proposedPosition.bottomRight.x -
      proposedPosition.width -
      2 * arrowOffset.x;
    // If at this point an overlap happens, we just have to settle
    return { style: 'topLeft', pixelPosition: proposedPosition };
  }

  getSpeechbubblePixelPosition({ lat, lon }) {
    const { map } = this.props.leaflet;
    const leafletPixelPosition = {
      ...map.latLngToLayerPoint({ lat, lon }),
      width: 105,
      height: 30,
    }; // Offset 15 x 10
    const truePixelPosition = {
      topLeft: {
        x: leafletPixelPosition.x + offsetSpeechBubble.x,
        y: leafletPixelPosition.y - offsetSpeechBubble.y,
      },
      bottomRight: {
        x:
          leafletPixelPosition.x +
          offsetSpeechBubble.x +
          leafletPixelPosition.width,
        y:
          leafletPixelPosition.y -
          offsetSpeechBubble.y +
          leafletPixelPosition.height,
      },
      width: leafletPixelPosition.width,
      height: leafletPixelPosition.height,
    };
    return truePixelPosition;
  }

  getSpeechBubbleStyle(position, pixelPositions) {
    const proposedPosition = { ...position };
    let overlap = this.doMarkersOverlap(proposedPosition, pixelPositions);
    // The area used to calculate overlaps excludes the arrow part for simplicity. This offset x and y are caused by the area that the arrow takes
    const arrowOffset = { x: 13, y: 10 };
    if (!overlap) {
      return { style: 'topRight', position: proposedPosition };
    }
    proposedPosition.topLeft.x =
      proposedPosition.topLeft.x - proposedPosition.width - 2 * arrowOffset.x;
    proposedPosition.bottomRight.x =
      proposedPosition.bottomRight.x -
      proposedPosition.width -
      2 * arrowOffset.x;
    overlap = this.doMarkersOverlap(proposedPosition, pixelPositions);
    if (!overlap) {
      return { style: 'topLeft', position: proposedPosition };
    }
    proposedPosition.topLeft.y =
      proposedPosition.topLeft.y + proposedPosition.height + 2 * arrowOffset.y;
    proposedPosition.bottomRight.y =
      proposedPosition.bottomRight.y +
      proposedPosition.height +
      2 * arrowOffset.y;
    overlap = this.doMarkersOverlap(proposedPosition, pixelPositions);
    if (!overlap) {
      return { style: 'bottomLeft', position: proposedPosition };
    }
    proposedPosition.topLeft.x =
      proposedPosition.topLeft.x + proposedPosition.width + 2 * arrowOffset.x;
    proposedPosition.bottomRight.x =
      proposedPosition.bottomRight.x +
      proposedPosition.width +
      2 * arrowOffset.x;
    // Settle for this even if overlap happens
    return { style: 'bottomRight', position: proposedPosition };
  }

  doMarkersOverlap = (proposedPosition, existingPositions) => {
    const l1 = proposedPosition.topLeft;
    const r1 = proposedPosition.bottomRight;
    for (let i = 0; i < existingPositions.length; i++) {
      const markerPosition = existingPositions[i];
      const l2 = markerPosition.topLeft;
      const r2 = markerPosition.bottomRight;
      // On the left
      if (l1.x > r2.x || l2.x > r1.x) {
        // eslint-disable-next-line no-continue
        continue;
      }
      // Above
      if (r1.y < l2.y || r2.y < l1.y) {
        // eslint-disable-next-line no-continue
        continue;
      }
      return true;
    }
    return false;
  };

  getSpeechBubbleText(leg, nextLeg) {
    let duration = '';
    const transferStart = leg.endTime;
    const transferEnd = nextLeg.startTime;
    if (transferStart && transferEnd) {
      duration = Math.floor((transferEnd - transferStart) / 1000 / 60);
    }
    return `${this.context.intl.formatMessage({
      id: 'transfer',
      defaultMessage: 'Transfer',
    })}: ${duration}min`;
  }

  componentDidMount() {
    this.props.leaflet.map.on('zoomend', this.onMapZoom);
  }

  componentWillUnmount = () => {
    this.props.leaflet.map.off('zoomend', this.onMapZoom);
  };

  onMapZoom = () => {
    this.forceUpdate();
  };

  render() {
    if (!isBrowser) {
      return '';
    }

    const objs = [];
    const pixelPositions = [];
    const legsWithPositions = this.props.transitLegs.map(leg => ({
      ...leg,
      ...this.getLegMarkerPixelPosition(leg),
    }));

    // Draw regular legmarkers first, no tweaking needed
    const legsRegular = legsWithPositions.filter(leg => leg.type === 'regular');
    legsRegular.forEach(leg => {
      objs.push(
        <LegMarker
          key={`${leg.index},${leg.mode}legmarker`}
          disableModeIcons
          renderName
          wide={
            leg.nextLeg?.interlineWithPreviousLeg &&
            leg.interliningWithRoute !== leg.route.shortName
          }
          color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
          leg={{
            from: leg.from,
            to: leg.nextLeg?.interlineWithPreviousLeg ? leg.nextLeg.to : leg.to,
            lat: leg.middle.lat,
            lon: leg.middle.lon,
            name: leg.legName,
            gtfsId: leg.from.stop.gtfsId,
            code: leg.from.stop.code,
          }}
          mode={leg.mode}
          zIndexOffset={leg.zIndexOffset} // Make sure the LegMarker always stays above the StopMarkers
        />,
      );
      pixelPositions.push({
        topLeft: leg.topLeft,
        bottomRight: leg.bottomRight,
      });
    });

    // Then, draw leg markers with arrows
    const arrowLegs = legsWithPositions.filter(leg => leg.type === 'arrow');
    arrowLegs.forEach(leg => {
      // Find style that doesn't cause the marker to overlap with anything
      const styleAndPosition = this.getArrowMarkerStyle(leg, pixelPositions);
      objs.push(
        <LegMarker
          key={`${leg.index},${leg.mode}legmarker`}
          disableModeIcons
          renderName
          style={styleAndPosition.style}
          wide={
            leg.nextLeg?.interlineWithPreviousLeg &&
            leg.interliningWithRoute !== leg.route.shortName
          }
          color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
          leg={{
            from: leg.from,
            to: leg.nextLeg?.interlineWithPreviousLeg ? leg.nextLeg.to : leg.to,
            lat: leg.middle.lat,
            lon: leg.middle.lon,
            name: leg.legName,
            gtfsId: leg.from.stop.gtfsId,
            code: leg.from.stop.code,
          }}
          mode={leg.mode}
          zIndexOffset={leg.zIndexOffset} // Make sure the LegMarker always stays above the StopMarkers
        />,
      );
      pixelPositions.push(styleAndPosition.pixelPosition);
    });

    // Finally, draw transfer stop speechbubbles
    const legsWithTransferStops = [...this.props.transitLegs];
    legsWithTransferStops.pop(); // Excluding the finishing leg
    legsWithTransferStops.forEach((leg, index) => {
      const speechBubblePixelPosition = this.getSpeechbubblePixelPosition(
        leg.to,
      );
      const styleAndPosition = this.getSpeechBubbleStyle(
        speechBubblePixelPosition,
        pixelPositions,
      );
      const text = this.getSpeechBubbleText(
        leg,
        this.props.transitLegs[index + 1],
      );
      objs.push(
        <SpeechBubble
          key={`speech_${leg.to.stop.gtfsId}`}
          position={{ lat: leg.to.lat, lon: leg.to.lon }}
          text={text}
          speechBubbleStyle={styleAndPosition.style}
          zIndexOffset={leg.zIndexOffset}
        />,
      );
      pixelPositions.push(styleAndPosition.position);
    });

    return <div>{objs}</div>;
  }
}

export default withLeaflet(TransitLegMarkers);

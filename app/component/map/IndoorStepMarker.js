import React from 'react';
/* eslint-disable react/no-array-index-key */

import PropTypes from 'prop-types';
import { default as L } from 'leaflet';

import { intlShape } from 'react-intl';
import cx from 'classnames';
import { configShape, locationShape } from '../../util/shapes';
import GenericMarker from './GenericMarker';

import Card from '../Card';
import PopupHeader from './PopupHeader';
import Icon from '../Icon';
import { IndoorStepType, VerticalDirection } from '../../constants';
import { getVerticalTransportationUseIconId } from '../../util/indoorUtils';

export default function IndoorStepMarker(
  { position, index, indoorSteps },
  { intl },
) {
  const objs = [];

  const getIcon = () => {
    const radius = 10;
    const iconSvg = `
        <svg viewBox="0 0 ${radius * 2} ${radius * 2}">
          <circle
            class="indoor-step-marker"
            cx="${radius}"
            cy="${radius}"
            r="${radius * 0.7}"
            stroke-width="${radius * 0.4}"
          />
        </svg>`;

    return L.divIcon({
      html: iconSvg,
      iconSize: [radius * 2, radius * 2],
      className: 'map-indoor-step-marker disable-icon-border',
    });
  };

  objs.push(
    <GenericMarker
      key={`verticaltransportationusegenericmarker_lat_${position.lat}_lon_${position.lon}`}
      position={position}
      getIcon={getIcon}
      zIndexOffset={13050}
      maxWidth={450}
      minWidth={180}
    >
      <Card>
        <PopupHeader
          header={intl.formatMessage({
            id: 'itinerary-indoor-route',
            defaultMessage: 'Indoor route',
          })}
        />
        <div className="bottom indoor-step-popup-container">
          <div className="indoor-step-popup-icons">
            {indoorSteps.map((obj, i, filteredObjs) => (
              <React.Fragment
                key={`verticaltransportationuseicon_lat_${position.lat}_lon_${position.lon}_index_${i}`}
              >
                <Icon
                  img={getVerticalTransportationUseIconId(
                    obj.feature?.verticalDirection,
                    // eslint-disable-next-line no-underscore-dangle
                    obj.feature?.__typename,
                    true,
                  )}
                  className="indoor-step-popup-icon"
                />
                {filteredObjs.length !== i + 1 ? (
                  <Icon
                    img="icon_arrow-right-long"
                    className="arrow-popup-icon"
                  />
                ) : null}
              </React.Fragment>
            ))}
          </div>
          <div className="indoor-step-popup-line-container">
            <div className="indoor-step-popup-line-circle-container">
              {indoorSteps.map((obj, i) => (
                <React.Fragment
                  key={`indoorstepmarker_lat_${position.lat}_lon_${position.lon}_index_${i}`}
                >
                  <div
                    className={cx('indoor-step-popup-line-circle', {
                      selected: index === i,
                    })}
                  >
                    <svg width={28} height={28}>
                      <circle
                        className={cx('indoor-step-marker', {
                          selected: index === i,
                        })}
                        width={28}
                        cx={14}
                        cy={14}
                        r={6}
                        strokeWidth={4}
                      />
                    </svg>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="indoor-step-popup-line indoor-dotted-line-horizontal" />
          </div>
        </div>
      </Card>
    </GenericMarker>,
  );

  return <div>{objs}</div>;
}

IndoorStepMarker.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

IndoorStepMarker.propTypes = {
  position: locationShape.isRequired,
  index: PropTypes.number.isRequired,
  indoorSteps: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(Object.values(IndoorStepType)),
      feature: PropTypes.shape({
        verticalDirection: PropTypes.oneOf(Object.values(VerticalDirection)),
      }),
    }),
  ),
};

IndoorStepMarker.defaultProps = {
  indoorSteps: [],
};

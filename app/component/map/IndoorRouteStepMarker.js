import React, { useEffect, useState } from 'react';
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
import { IndoorRouteStepType, VerticalDirection } from '../../constants';
import { getVerticalTransportationUseIconId } from '../../util/indoorUtils';

export default function IndoorRouteStepMarker(
  { position, index, indoorRouteSteps },
  { intl },
) {
  const [indoorBackgroundImageUrl, setIndoorBackgroundImageUrl] = useState();
  useEffect(() => {
    import(
      /* webpackChunkName: "indoor-dotted-line-horizontal" */ `../../configurations/images/default/indoor-dotted-line-horizontal.svg`
    ).then(insideImageUrl => {
      setIndoorBackgroundImageUrl(`url(${insideImageUrl.default})`);
    });
  }, []);

  const objs = [];

  const getIcon = () => {
    const radius = 10;
    const iconSvg = `
        <svg viewBox="0 0 ${radius * 2} ${radius * 2}">
          <circle
            class="indoor-route-step-marker"
            cx="${radius}"
            cy="${radius}"
            r="${radius * 0.7}"
            stroke-width="${radius * 0.4}"
          />
        </svg>`;

    return L.divIcon({
      html: iconSvg,
      iconSize: [radius * 2, radius * 2],
      className: 'map-indoor-route-step-marker disable-icon-border',
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
        <div className="bottom indoor-route-step-popup-container">
          <div className="indoor-route-step-popup-icons">
            {indoorRouteSteps.map((obj, i, filteredObjs) => (
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
                  className="indoor-route-step-popup-icon"
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
          <div className="indoor-route-step-popup-line-container">
            <div className="indoor-route-step-popup-line-circle-container">
              {indoorRouteSteps.map((obj, i) => (
                <React.Fragment
                  key={`indoorroutestepmarker_lat_${position.lat}_lon_${position.lon}_index_${i}`}
                >
                  <div className="indoor-route-step-popup-line-circle">
                    <svg width={28} height={28}>
                      <circle
                        className={cx('indoor-route-step-marker', {
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
            <div
              style={{
                backgroundImage: indoorBackgroundImageUrl,
              }}
              className="indoor-route-step-popup-line"
            />
          </div>
        </div>
      </Card>
    </GenericMarker>,
  );

  return <div>{objs}</div>;
}

IndoorRouteStepMarker.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

IndoorRouteStepMarker.propTypes = {
  position: locationShape.isRequired,
  index: PropTypes.number.isRequired,
  indoorRouteSteps: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(Object.values(IndoorRouteStepType)),
      feature: PropTypes.shape({
        verticalDirection: PropTypes.oneOf(Object.values(VerticalDirection)),
      }),
    }),
  ),
};

IndoorRouteStepMarker.defaultProps = {
  indoorRouteSteps: [],
};

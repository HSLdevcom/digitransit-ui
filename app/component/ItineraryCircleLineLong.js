import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import Icon from './Icon';
import RouteNumber from './RouteNumber';

const ItineraryCircleLineLong = props => {
  const [imgUrl, setImgUrl] = useState('');

  useEffect(() => {
    import(
      /* webpackChunkName: "dotted-line" */ `../configurations/images/default/dotted-line.svg`
    ).then(imageUrl => {
      setImgUrl(`url(${imageUrl.default})`);
    });
  }, []);

  const isFirstChild = () => {
    return props.index === 0;
  };

  const getMarker = top => {
    if (isFirstChild() && top) {
      return (
        <>
          <div className="itinerary-icon-container start">
            <Icon
              img="icon-icon_mapMarker-from"
              className="itinerary-icon from from-it"
            />
          </div>
        </>
      );
    }
    return null;
  };
  const topMarker = getMarker(true);
  const bottomMarker = getMarker(false);
  const legBeforeLineStyle = { color: props.color };
  // eslint-disable-next-line global-require
  legBeforeLineStyle.backgroundImage = imgUrl;
  return (
    <div
      className={cx('leg-before long bicycle', {
        first: props.index === 0,
      })}
      aria-hidden="true"
    >
      {topMarker}
      <div
        style={legBeforeLineStyle}
        className={cx('leg-before-line top', props.modeClassNames[0])}
      />
      <div className="itinerary-route-number first">
        <RouteNumber mode={props.modeClassNames[0]} vertical />
      </div>

      <div
        style={legBeforeLineStyle}
        className={cx(
          'leg-before-line middle',
          props.modeClassNames[0] === 'bicycle'
            ? props.modeClassNames[0]
            : props.modeClassNames[1],
        )}
      />
      <div className="itinerary-route-number second">
        <RouteNumber mode={props.modeClassNames[1]} vertical />
      </div>
      <div
        style={legBeforeLineStyle}
        className={cx('leg-before-line bottom', props.modeClassNames[1])}
      />
      {props.renderBottomMarker && <>{bottomMarker}</>}
    </div>
  );
};

ItineraryCircleLineLong.propTypes = {
  index: PropTypes.number.isRequired,
  color: PropTypes.string,
  modeClassNames: PropTypes.arrayOf(PropTypes.string),
  renderBottomMarker: PropTypes.bool,
};

export default ItineraryCircleLineLong;

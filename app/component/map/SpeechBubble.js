import React from 'react';
import PropTypes from 'prop-types';
import { isBrowser } from '../../util/browser';

let L;
let Marker;
/* eslint-disable global-require */
if (isBrowser) {
  L = require('leaflet');
  Marker = require('react-leaflet/es/Marker').default;
}

export default function SpeechBubble({ position, text, flip }) {
  return (
    <Marker
      key="_text"
      position={{
        lat: position.lat,
        lng: position.lon,
      }}
      interactive={false}
      icon={L.divIcon({
        html: `<div class="shadow"></div>
            <div>${text}</div>`,
        className: `legmarker speech-bubble ${flip ? 'flip' : 'normal'}`,
        iconSize: null,
      })}
      keyboard={false}
    />
  );
}
SpeechBubble.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  text: PropTypes.string,
  flip: PropTypes.bool,
};

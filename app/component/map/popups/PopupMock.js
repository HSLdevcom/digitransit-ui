import PropTypes from 'prop-types';
import React from 'react';

/**
 * This component should be visually similar to the Popup component from
 * react-leaflet in the scope of this project.
 *
 * @param {*} props Check the propTypes specification for more information.
 */
const PopupMock = props => {
  if (props.importCss) {
    import('leaflet/dist/leaflet.css').catch(() => {});
  }

  let height;
  switch (props.size) {
    case 'small':
      height = 10;
      break;
    case 'medium':
    default:
      height = 16;
      break;
    case 'large':
      height = 21;
      break;
  }

  return (
    <div
      className="leaflet-container"
      style={{ height: `${height}rem`, position: 'relative' }}
    >
      <div
        className="leaflet-popup popup leaflet-zoom-animated"
        style={{ transform: `translate3d(30px, 10px, 0)` }}
      >
        <div className="leaflet-popup-content-wrapper">
          <a className="leaflet-popup-close-button" href="#close">
            ×
          </a>
          <div className="leaflet-popup-content">{props.children}</div>
          <div className="leaflet-popup-tip-container">
            <div className="leaflet-popup-tip" />
          </div>
        </div>
      </div>
    </div>
  );
};

PopupMock.propTypes = {
  children: PropTypes.node.isRequired,
  importCss: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

PopupMock.defaultProps = {
  importCss: true,
  size: 'medium',
};

export default PopupMock;

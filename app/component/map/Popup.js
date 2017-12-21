import { Popup as LeafletPopup } from 'leaflet';
import PropTypes from 'prop-types';
import { Children } from 'react';
import { createPortal } from 'react-dom';
import MapComponent from 'react-leaflet/es/MapComponent';
import latlng from 'react-leaflet/es/propTypes/latlng';
import layer from 'react-leaflet/es/propTypes/layer';
import map from 'react-leaflet/es/propTypes/map';
import events from '../../util/events';

/* eslint-disable no-underscore-dangle */

export default class Popup extends MapComponent {
  static propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func,
    onOpen: PropTypes.func,
    position: latlng,
  };

  static contextTypes = {
    map,
    popupContainer: layer,
    pane: PropTypes.string,
  };

  static defaultProps = {
    pane: 'popupPane',
  };

  getOptions(props) {
    return {
      ...super.getOptions(props),
      autoPan: false,
    };
  }

  createLeafletElement(props) {
    return new LeafletPopup(
      this.getOptions(props),
      this.context.popupContainer,
    );
  }

  updateLeafletElement(fromProps, toProps) {
    if (toProps.position !== fromProps.position) {
      this.leafletElement.setLatLng(toProps.position);
    }
  }

  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = this.createLeafletElement(this.props);
    this.leafletElement.options.autoPan = this.props.autoPan !== false;

    this.setState({ isPopupOpen: this.leafletElement.isOpen() });

    this.context.map.on({
      popupopen: this.onPopupOpen,
      popupclose: this.onPopupClose,
    });
  }

  componentDidMount() {
    const { position } = this.props;
    const { popupContainer } = this.context;
    const el = this.leafletElement;

    if (popupContainer) {
      // Attach to container component
      popupContainer.bindPopup(el);
    } else {
      // Attach to a Map
      if (position) {
        el.setLatLng(position);
      }
      el.openOn(this.context.map);
    }
  }

  componentDidUpdate(prevProps) {
    this.updateLeafletElement(prevProps, this.props);

    if (this.leafletElement.isOpen()) {
      this.leafletElement.update();
      if (this.props.autoPan !== false) {
        if (this.leafletElement._map && this.leafletElement._map._panAnim) {
          this.leafletElement._map._panAnim = undefined;
        }
        this.leafletElement._adjustPan();
      }
    }
  }

  componentWillUnmount() {
    this.context.map.off({
      popupopen: this.onPopupOpen,
      popupclose: this.onPopupClose,
    });
    this.context.map.removeLayer(this.leafletElement);

    super.componentWillUnmount();
  }

  onPopupOpen = ({ popup }) => {
    events.emit('popupOpened');
    if (popup === this.leafletElement) {
      this.setState({ isPopupOpen: true }, () => {
        if (this.props.onOpen) {
          this.props.onOpen();
        }
      });
    }
  };

  onPopupClose = ({ popup }) => {
    if (popup === this.leafletElement) {
      this.setState({ isPopupOpen: false }, () => {
        if (this.props.onClose) {
          this.props.onClose();
        }
      });
    }
  };

  render() {
    if (!this.state.isPopupOpen || this.props.children == null) {
      return null;
    }
    return createPortal(
      Children.only(this.props.children),
      this.leafletElement._contentNode,
    );
  }
}

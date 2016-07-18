import React from 'react';
import Relay from 'react-relay';
import StopRoute from '../../../route/StopRoute';
import StopMarkerPopup from '../popups/stop-marker-popup';
import provideContext from 'fluxible-addons-react/provideContext';
import { intlShape } from 'react-intl';
import GenericMarker from '../GenericMarker';
import Icon from '../../icon/icon';
import ReactDomServer from 'react-dom/server';
import config from '../../../config';

const isBrowser = typeof window !== 'undefined' && window !== null;

/* eslint-disable max-len */
const iconSvg = '<svg viewBox="0 0 18 18">n  <circle key="halo" class="stop-halo" cx="9" cy="9" r="8" stroke-width="1"/>n  <circle key="stop" class="stop" cx="9" cy="9" r="4.5" stroke-width="4"/>n</svg>';
const selectedIconSvg = '<svg viewBox="0 0 28 28">n  <circle key="halo" class="stop-halo" cx="14" cy="14" r="13" stroke-width="1"/>n  <circle key="stop" class="stop" cx="14" cy="14" r="8" stroke-width="7"/>n</svg>';
const transferIconSvg = '<svg viewBox="0 0 28 28">n  <circle key="halo" class="stop-halo" cx="14" cy="14" r="13" stroke-width="1"/>n  <circle key="stop" class="stop" cx="14" cy="14" r="8" stroke-width="7"/>n</svg>';
const smallIconSvg = '<svg viewBox="0 0 8 8">n  <circle class="stop-small" cx="4" cy="4" r="3" stroke-width="1"/>n</svg>';
/* eslint-enable max-len */

const StopMarkerPopupWithContext = provideContext(StopMarkerPopup, {
  intl: intlShape.isRequired,
  router: React.PropTypes.object.isRequired,
  route: React.PropTypes.object.isRequired,
});

class StopMarker extends React.Component {
  static propTypes = {
    stop: React.PropTypes.object.isRequired,
    mode: React.PropTypes.string.isRequired,
    renderName: React.PropTypes.bool,
    disableModeIcons: React.PropTypes.bool,
    selected: React.PropTypes.bool,
  };

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    route: React.PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  getStopMarker() {
    let iconId;
    let size;
    let iconSelected;
    let icon;
    let iconSmall;

    const loadingPopupStyle = {
      height: 150,
    };

    let iconSizes = {
      smallIconSvg: [8, 8],
      iconSvg: [18, 18],
      selectedIconSvg: [28, 28],
    };

    if (this.props.stop.transfer) {
      iconSmall = transferIconSvg;
      icon = transferIconSvg;
      iconSelected = transferIconSvg;
      size = [18, 18];

      iconSizes = {
        smallIconSvg: size,
        iconSvg: size,
        selectedIconSvg: size,
      };
    } else if (config.map.useModeIconsInNonTileLayer && !this.props.disableModeIcons) {
      iconId = `icon-icon_${this.props.mode}`;
      iconSmall = ReactDomServer.renderToString(
        <Icon viewBox="0 0 8 8" img={iconId} className="stop-marker" />
      );
      icon = ReactDomServer.renderToString(
        <Icon viewBox="0 0 18 18" img={iconId} className="stop-marker" />
      );
      iconSelected = ReactDomServer.renderToString(
        <Icon viewBox="0 0 28 28" img={iconId} className="stop-marker" />
      );
    } else {
      iconSmall = smallIconSvg;
      icon = iconSvg;
      iconSelected = selectedIconSvg;
    }

    return (
      <GenericMarker
        position={{
          lat: this.props.stop.lat,
          lon: this.props.stop.lon,
        }}
        mode={this.props.mode}
        icons={{
          smallIconSvg: iconSmall,
          iconSvg: icon,
          selectedIconSvg: iconSelected,
        }}
        iconSizes={iconSizes}
        id={this.props.stop.gtfsId}
        renderName={this.props.renderName}
        selected={this.props.selected}
        name={this.props.stop.name}
      >
        <Relay.RootContainer
          Component={StopMarkerPopup}
          route={new StopRoute({
            stopId: this.props.stop.gtfsId,
            date: this.context.getStore('TimeStore').getCurrentTime().format('YYYYMMDD'),
          })}
          renderLoading={() =>
            <div className="card" style={loadingPopupStyle}><div className="spinner-loader" /></div>
          }
          renderFetched={data =>
            <StopMarkerPopupWithContext {...data} context={this.context} />
          }
        />
      </GenericMarker>
    );
  }

  render() {
    if (!isBrowser) {
      return '';
    }

    return <div>{this.getStopMarker()}</div>;
  }
}

export default StopMarker;

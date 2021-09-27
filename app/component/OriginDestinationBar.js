import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import withSearchContext from './WithSearchContext';
import {
  setIntermediatePlaces,
  updateItinerarySearch,
  onLocationPopup,
} from '../util/queryUtils';
import { getIntermediatePlaces, locationToOTP } from '../util/otpStrings';
import { dtLocationShape } from '../util/shapes';
import { setViaPoints } from '../action/ViaPointActions';
import { LightenDarkenColor } from '../util/colorUtils';
import { getRefPoint } from '../util/apiUtils';
import { showCityBikes } from '../util/modeUtils';

const DTAutosuggestPanelWithSearchContext = withSearchContext(
  DTAutosuggestPanel,
);

class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    language: PropTypes.string,
    isMobile: PropTypes.bool,
    showFavourites: PropTypes.bool.isRequired,
    viaPoints: PropTypes.array,
    locationState: dtLocationShape.isRequired,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    match: matchShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static defaultProps = {
    className: undefined,
    language: 'fi',
    isMobile: false,
    viaPoints: [],
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const viaPoints = getIntermediatePlaces(this.context.match.location.query);
    this.context.executeAction(setViaPoints, viaPoints);
    this.mounted = true;
  }

  updateViaPoints = newViaPoints => {
    // fixes the bug that DTPanel starts excecuting updateViaPoints before this component is even mounted
    if (this.mounted) {
      const p = newViaPoints.filter(vp => vp.lat && vp.address);
      this.context.executeAction(setViaPoints, p);
      setIntermediatePlaces(
        this.context.router,
        this.context.match,
        p.map(locationToOTP),
      );
    }
  };

  swapEndpoints = () => {
    const { location } = this.context.match;
    const intermediatePlaces = getIntermediatePlaces(location.query);
    if (intermediatePlaces.length > 1) {
      location.query.intermediatePlaces.reverse();
    }
    updateItinerarySearch(
      this.props.destination,
      this.props.origin,
      this.context.router,
      location,
      this.context.executeAction,
    );
  };

  onLocationSelect = (item, id) => {
    let action;
    if (id === parseInt(id, 10)) {
      // id = via point index
      action = 'EditJourneyViaPoint';
      const points = [...this.props.viaPoints];
      points[id] = { ...item };
      this.updateViaPoints(points);
    } else {
      action =
        id === 'origin' ? 'EditJourneyStartPoint' : 'EditJourneyEndPoint';
      onLocationPopup(
        item,
        id,
        this.context.router,
        this.context.match,
        this.context.executeAction,
      );
    }
    addAnalyticsEvent({
      action,
      category: 'ItinerarySettings',
      name: item.type,
    });
  };

  render() {
    const refPoint = getRefPoint(
      this.props.origin,
      this.props.destination,
      this.props.locationState,
    );
    const desktopTargets = ['Locations', 'CurrentPosition', 'Stops'];
    if (showCityBikes(this.context.config.cityBike?.networks)) {
      desktopTargets.push('BikeRentalStations');
    }
    const mobileTargets = [...desktopTargets, 'MapPosition'];

    return (
      <div
        className={cx(
          'origin-destination-bar',
          this.props.className,
          'flex-horizontal',
        )}
      >
        <DTAutosuggestPanelWithSearchContext
          appElement="#app"
          origin={this.props.origin}
          destination={this.props.destination}
          refPoint={refPoint}
          originPlaceHolder="search-origin-index"
          destinationPlaceHolder="search-destination-index"
          showMultiPointControls={this.context.config.viaPointsEnabled}
          viaPoints={this.props.viaPoints}
          updateViaPoints={this.updateViaPoints}
          addAnalyticsEvent={addAnalyticsEvent}
          swapOrder={this.swapEndpoints}
          selectHandler={this.onLocationSelect}
          sources={[
            'History',
            'Datasource',
            this.props.showFavourites ? 'Favourite' : '',
          ]}
          targets={this.props.isMobile ? mobileTargets : desktopTargets}
          lang={this.props.language}
          disableAutoFocus={this.props.isMobile}
          isMobile={this.props.isMobile}
          itineraryParams={this.context.match.location.query}
          color={this.context.config.colors.primary}
          hoverColor={
            this.context.config.colors.hover ||
            LightenDarkenColor(this.context.config.colors.primary, -20)
          }
        />{' '}
      </div>
    );
  }
}

const connectedComponent = connectToStores(
  OriginDestinationBar,
  ['PreferencesStore', 'FavouriteStore', 'ViaPointStore', 'PositionStore'],
  ({ getStore }) => ({
    language: getStore('PreferencesStore').getLanguage(),
    showFavourites: getStore('FavouriteStore').getStatus() === 'has-data',
    viaPoints: getStore('ViaPointStore').getViaPoints(),
    locationState: getStore('PositionStore').getLocationState(),
  }),
);

export { connectedComponent as default, OriginDestinationBar as Component };

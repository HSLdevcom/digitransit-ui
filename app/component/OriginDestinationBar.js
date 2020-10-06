// TODO: REMOVE
/* eslint-disable prettier/prettier */
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import ComponentUsageExample from './ComponentUsageExample';
import { PREFIX_ITINERARY_SUMMARY, navigateTo } from '../util/path';
import withSearchContext from './WithSearchContext';
import SelectFromMapHeader from './SelectFromMapHeader';
import SelectFromMapPageMap from './map/SelectFromMapPageMap';
import DTModal from './DTModal';
import { setIntermediatePlaces } from '../util/queryUtils';
import { getIntermediatePlaces } from '../util/otpStrings';
import { dtLocationShape } from '../util/shapes';

const DTAutosuggestPanelWithSearchContext = withSearchContext(
  DTAutosuggestPanel,
);

const locationToOtp = location =>
  `${location.address}::${location.lat},${location.lon}${
    location.locationSlack ? `::${location.locationSlack}` : ''
  }`;

class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    destination: dtLocationShape,
    origin: dtLocationShape,
    location: PropTypes.object,
    language: PropTypes.string,
    isMobile: PropTypes.bool,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    getStore: PropTypes.func.isRequired,
    match: matchShape.isRequired,
  };

  static defaultProps = {
    className: undefined,
    location: undefined,
    language: 'fi',
    isMobile: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      viaPoints: [],
    };
  }

  get location() {
    return this.props.location || this.context.match.location;
  }

  updateViaPoints = newViaPoints => {
    // console.log('Kaikki: ', newViaPoints);
    // console.log('Urlista: ', fromUrl)
    let fromMapFound = false;
    const newPoints = newViaPoints.filter(point => {
      if (point.address === 'Valitse sijainti kartalta') {
        fromMapFound = true;
        return false;
      }
      return true;
    });
    // console.log('Uudet: ', newPoints);
    this.setState(
      {
        showModal: fromMapFound,
        viaPoints: newPoints,
      },
      () => {
        if (!fromMapFound) {
          return setIntermediatePlaces(
            this.context.router,
            this.context.match,
            newPoints.map(locationToOtp),
          );
        }
        return null;
      },
    );
  };

  openSelectFromMapModal = () => {
    this.setState({
      showModal: true,
    });
  };

  closeSelectFromMapModal = () => {
    this.setState({
      showModal: false,
    });
  };

  renderSelectFromMapModal = () => {
    const titleId = 'select-from-map-no-title';
    return (
      <DTModal show={this.state.showModal}>
        <SelectFromMapHeader
          titleId={titleId}
          onBackBtnClick={this.closeSelectFromMapModal}
        />
        <SelectFromMapPageMap
          type="viaPoint"
          onConfirm={this.confirmMapSelection}
        />
      </DTModal>
    );
  };

  confirmMapSelection = (type, mapLocation) => {
    // console.log('CONFIRM! ', this.state.viaPoints, mapLocation);
    this.setState(prevState  => (
      {
        showModal: false,
        viaPoints: [...prevState.viaPoints, mapLocation],
      }),
      () => {
        const points = this.state.viaPoints.map(locationToOtp);
        // console.log('PISTEET: ', points);
        return setIntermediatePlaces(
          this.context.router,
          this.context.match,
          points,
        );
      },
    );
  };

  swapEndpoints = () => {
    const { location } = this;
    const intermediatePlaces = getIntermediatePlaces(location.query);
    if (intermediatePlaces.length > 1) {
      location.query.intermediatePlaces.reverse();
    }

    navigateTo({
      base: location,
      origin: this.props.destination,
      destination: this.props.origin,
      rootPath: PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
      resetIndex: true,
    });
  };

  render() {
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
          originPlaceHolder="search-origin-index"
          destinationPlaceHolder="search-destination-index"
          showMultiPointControls
          initialViaPoints={getIntermediatePlaces(
            this.props.location
              ? this.props.location.query
              : this.context.match.location.query,
          )}
          updateViaPoints={this.updateViaPoints}
          swapOrder={this.swapEndpoints}
          sources={[
            'History',
            'Datasource',
            this.props.isMobile ? 'Favourite' : '',
          ]}
          targets={[
            'Locations',
            'CurrentPosition',
            !this.props.isMobile ? 'SelectFromOwnLocations' : '',
            this.props.isMobile ? 'MapPosition' : '',
          ]}
          lang={this.props.language}
          disableAutoFocus={this.props.isMobile}
          isMobile={this.props.isMobile}
          itineraryParams={this.context.match.location.query}
        />{' '}
        {this.renderSelectFromMapModal()}
      </div>
    );
  }
}

OriginDestinationBar.description = (
  <React.Fragment>
    <ComponentUsageExample>
      <OriginDestinationBar
        destination={{ ready: false, set: false }}
        origin={{
          address: 'Messukeskus, Itä-Pasila, Helsinki',
          lat: 60.201415,
          lon: 24.936696,
          ready: true,
          set: true,
        }}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="with-viapoint">
      <OriginDestinationBar
        destination={{ ready: false, set: false }}
        location={{
          query: {
            intermediatePlaces: 'Opastinsilta 6, Helsinki::60.199093,24.940536',
          },
        }}
        origin={{
          address: 'Messukeskus, Itä-Pasila, Helsinki',
          lat: 60.201415,
          lon: 24.936696,
          ready: true,
          set: true,
        }}
      />
    </ComponentUsageExample>
  </React.Fragment>
);

const connectedComponent = connectToStores(
  OriginDestinationBar,
  ['PreferencesStore'],
  context => ({
    language: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, OriginDestinationBar as Component };

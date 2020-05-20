import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import loadable from '@loadable/component';
import { withCurrentTime } from '../util/DTSearchQueryUtils';
import ComponentUsageExample from './ComponentUsageExample';
import { PREFIX_ITINERARY_SUMMARY, navigateTo } from '../util/path';
import withSearchContext from './withSearchContext';
import getRelayEnvironment from '../util/getRelayEnvironment';

import {
  getIntermediatePlaces,
  setIntermediatePlaces,
} from '../util/queryUtils';
import { dtLocationShape } from '../util/shapes';

const DTAutosuggestPanel = loadable(
  () =>
    import('@digitransit-component/digitransit-component-autosuggest-panel'),
  { ssr: true },
);
const panelSources = ['Favourite', 'History', 'Datasource'];
const panelTargets = ['Locations', 'CurrentPosition'];
let panelData = {
  sources: panelSources,
  targets: panelTargets,
  showMultiPointControls: true,
  originPlaceHolder: 'search-origin-index',
  destinationPlaceHolder: 'search-destination-index',
};

const locationToOtp = location =>
  `${location.address}::${location.lat},${location.lon}${
    location.locationSlack ? `::${location.locationSlack}` : ''
  }`;

let AutosuggestPanelWithSearchContext;
class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    destination: dtLocationShape,
    origin: dtLocationShape,
    location: PropTypes.object,
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
  };

  constructor(props, context) {
    super(props);

    panelData = {
      ...panelData,
      ...this.props,
      initialViaPoints: getIntermediatePlaces(
        this.props.location
          ? this.props.location.query
          : context.match.location.query,
      ),
      updateViaPoints: this.updateViaPoints,
      swapOrder: this.swapEndpoints,
    };
    AutosuggestPanelWithSearchContext = getRelayEnvironment(
      withSearchContext(panelData, DTAutosuggestPanel),
    );
  }

  get location() {
    return this.props.location || this.context.match.location;
  }

  updateViaPoints = newViaPoints =>
    setIntermediatePlaces(
      this.context.router,
      this.context.match,
      newViaPoints.map(locationToOtp),
    );

  swapEndpoints = () => {
    const { location } = this;
    const locationWithTime = withCurrentTime(this.context.getStore, location);
    const intermediatePlaces = getIntermediatePlaces(location.query);
    if (intermediatePlaces.length > 1) {
      location.query.intermediatePlaces.reverse();
    }
    panelData.origin = this.props.destination;
    panelData.destination = this.props.origin;
    AutosuggestPanelWithSearchContext = getRelayEnvironment(
      withSearchContext(panelData, DTAutosuggestPanel),
    );

    navigateTo({
      base: locationWithTime,
      origin: this.props.destination,
      destination: this.props.origin,
      context: PREFIX_ITINERARY_SUMMARY,
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
        <AutosuggestPanelWithSearchContext />
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

export default OriginDestinationBar;

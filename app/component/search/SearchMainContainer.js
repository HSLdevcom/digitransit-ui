import React from 'react';
import { intlShape } from 'react-intl';
import Tab from 'material-ui/Tabs/Tab';

import { setEndpoint, setUseCurrent } from '../../action/EndpointActions';
import { executeSearch } from '../../action/SearchActions';
import FakeSearchBar from './FakeSearchBar';
import FakeSearchWithButton from './FakeSearchWithButton';
import GeolocationOrInput from './GeolocationOrInput';
import SearchModal from './SearchModal';

class SearchMainContainer extends React.Component {
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getStore: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  constructor(args) {
    super(...args);
    this.searchInputs = [];
  }

  state = {
    selectedTab: 'destination',
    modalIsOpen: false,
  };

  componentWillMount = () => (
    this.context.getStore('SearchStore').addChangeListener(this.onSearchChange)
  );

  componentWillUnmount = () => (
    this.context.getStore('SearchStore').removeChangeListener(this.onSearchChange)
  );

  onSearchChange = (payload) => {
    if (payload.action === 'open') {
      return this.openDialog(payload.data);
    }
    return undefined;
  }

  onTabChange = (tab) => (
    this.changeToTab(tab.props.value)
  );

  changeToTab = (tabname) => (
    this.setState({
      selectedTab: tabname,
    }, () => {
      if (tabname === 'origin') {
        this.context.executeAction(executeSearch, {
          input: this.context.getStore('EndpointStore').getOrigin().address || '',
          type: 'endpoint',
        });
      }

      if (tabname === 'destination') {
        this.context.executeAction(executeSearch, {
          input: this.context.getStore('EndpointStore').getDestination().address || '',
          type: 'endpoint',
        });
      }

      if (tabname === 'search') {
        this.context.executeAction(executeSearch, {
          input: '',
          type: 'search',
        });
      }

      return setTimeout(() => this.focusInput(tabname), 0);
    })
  );

  closeModal = () => (
    this.setState({
      modalIsOpen: false,
    })
  );

  focusInput = (value) => (
    this.searchInputs[value].searchInput.autowhatever.refs.input.focus()
  );

  openDialog = (tab) => {
    this.setState({ modalIsOpen: true });
    this.changeToTab(tab);
  };

  clickSearch = () => {
    const origin = this.context.getStore('EndpointStore').getOrigin();
    const geolocation = this.context.getStore('PositionStore').getLocationState();
    const hasOrigin = origin.lat || (origin.useCurrentPosition && geolocation.hasLocation);

    this.openDialog(hasOrigin ? 'destination' : 'origin');

    if (hasOrigin) {
      return this.context.executeAction(executeSearch, {
        input: this.context.getStore('EndpointStore').getDestination().address || '',
        type: 'endpoint',
      });
    }
    return this.context.executeAction(executeSearch, {
      input: '',
      type: 'endpoint',
    });
  }

  makeEndpointTab = (tabname, tablabel, endpoint) => (
    <Tab
      className={`search-header__button${this.state.selectedTab === tabname ? '--selected' : ''}`}
      label={tablabel}
      value={tabname}
      id={tabname}
      onActive={this.onTabChange}
    >
      <GeolocationOrInput
        ref={(c) => { this.searchInputs[tabname] = c; }}
        id={`search-${tabname}`}
        endpoint={endpoint}
        type="endpoint"
        onSuggestionSelected={(name, item) => {
          if (item.type === 'CurrentLocation') {
            this.context.executeAction(setUseCurrent, tabname);
          } else {
            this.context.executeAction(setEndpoint, {
              target: tabname,
              endpoint: {
                lat: item.geometry.coordinates[1],
                lon: item.geometry.coordinates[0],
                address: name,
              },
            });
          }

          return this.closeModal();
        }}
      />
    </Tab>
  );

  render = () => {
    const searchTabLabel = this.context.intl.formatMessage({
      id: 'search',
      defaultMessage: 'SEARCH',
    });

    const destinationPlaceholder = this.context.intl.formatMessage({
      id: 'destination-placeholder',
      defaultMessage: 'Where to? - address or stop',
    });

    const fakeSearchBar = (
      <FakeSearchBar
        onClick={this.clickSearch}
        placeholder={destinationPlaceholder}
        id="front-page-search-bar"
      />);

    return (
      <div>
        <FakeSearchWithButton
          fakeSearchBar={fakeSearchBar}
          onClick={this.clickSearch}
        />
        <SearchModal
          selectedTab={this.state.selectedTab}
          modalIsOpen={this.state.modalIsOpen}
          closeModal={this.closeModal}
        >
          {this.makeEndpointTab('origin',
                   this.context.intl.formatMessage({
                     id: 'origin',
                     defaultMessage: 'Origin',
                   }),
                   this.context.getStore('EndpointStore').getOrigin())}
          {this.makeEndpointTab('destination',
                   this.context.intl.formatMessage({
                     id: 'destination',
                     defaultMessage: 'destination',
                   }),
                   this.context.getStore('EndpointStore').getDestination())}
          <Tab
            className={
              `search-header__button${this.state.selectedTab === 'search' ? '--selected' : ''}`}
            label={searchTabLabel}
            value="search"
            id="search-button"
            onActive={this.onTabChange}
          >
            <GeolocationOrInput
              ref={(c) => { this.searchInputs.search = c; }}
              initialValue=""
              id="search"
              type="search"
              onSuggestionSelected={(name, item) => {
                if (item.properties.link) {
                  this.context.router.push(item.properties.link);
                }
                return this.closeModal();
              }}
            />
          </Tab>
        </SearchModal>
      </div>);
  }
}

export default SearchMainContainer;

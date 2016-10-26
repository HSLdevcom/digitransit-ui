import React from 'react';
import { intlShape } from 'react-intl';
import Tab from 'material-ui/Tabs/Tab';
import getContext from 'recompose/getContext';

import { setEndpoint, setUseCurrent } from '../../action/EndpointActions';
import { executeSearch } from '../../action/SearchActions';
import FakeSearchBar from './FakeSearchBar';
import { default as FakeSearchWithButton } from './FakeSearchWithButton';
import GeolocationOrInput from './GeolocationOrInput';
import SearchInputContainer from './SearchInputContainer';
import SearchModal from './SearchModal';
import SearchModalLarge from './SearchModalLarge';

class SearchMainContainer extends React.Component {
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getStore: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    className: React.PropTypes.string,
    breakpoint: React.PropTypes.string,
  }

  static defaultProps= {
    breakpoint: 'medium',
  }

  constructor(args) {
    super(...args);
    this.searchInputs = [];
  }

  state = {
    selectedTab: 'destination',
    modalIsOpen: false,
  };

  componentDidMount = () => (
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

  onTabChange = tab => (
    this.changeToTab(tab.props.value)
  );

  getContent = () => {
    const searchTabLabel = this.context.intl.formatMessage({
      id: 'search',
      defaultMessage: 'SEARCH',
    });

    return ([
      this.makeEndpointTab('origin',
             this.context.intl.formatMessage({
               id: 'origin',
               defaultMessage: 'Origin',
             }),
             this.context.getStore('EndpointStore').getOrigin()),
      this.makeEndpointTab('destination',
             this.context.intl.formatMessage({
               id: 'destination',
               defaultMessage: 'destination',
             }),
             this.context.getStore('EndpointStore').getDestination()),
      <Tab
        key="haku"
        className={
        `search-header__button${this.state.selectedTab === 'search' ? '--selected' : ''}`}
        label={searchTabLabel}
        value="search"
        id="search-button"
        onActive={this.onTabChange}
      >
        <SearchInputContainer
          // Hack. In GeolocationOrInput, c.searchInput causes rendering problems
          ref={(c) => { this.searchInputs.search = { searchInput: c }; }}
          id="search"
          initialValue=""
          type="search"
          onSuggestionSelected={(name, item) => {
            if (item.properties.link) {
              this.context.router.push(item.properties.link);
            }
            return this.closeModal();
          }}
        />
      </Tab>]);
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

  openDialog = (tab) => {
    this.setState({ modalIsOpen: true });
    this.changeToTab(tab);
  };

  focusInput = value => (
    // this.searchInputs[value].searchInput is a hack
    this.searchInputs[value].searchInput.autowhatever.refs.input.focus()
  );

  closeModal = () => (
    this.setState({
      modalIsOpen: false,
    })
  );

  changeToTab = tabname => (
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
      // Cannot use setTimeout for the focus, or iOS Safari won't show the caret.
      // Other browsers don't seem to care one way or another.
      this.focusInput(tabname);
    })
  );

  makeEndpointTab = (tabname, tablabel, endpoint) => (
    <Tab
      className={`search-header__button${this.state.selectedTab === tabname ? '--selected' : ''}`}
      label={tablabel}
      value={tabname}
      id={tabname}
      key={{ tabname }}
      onActive={this.onTabChange}
    >
      <GeolocationOrInput
        ref={(c) => { this.searchInputs[tabname] = c; }}
        id={`search-${tabname}`}
        useCurrentPosition={endpoint.useCurrentPosition}
        initialValue={endpoint.address}
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
      <div
        className={`fake-search-container bp-${this.props.breakpoint} ${this.props.className ||
          ''}`}
      >
        <FakeSearchWithButton
          fakeSearchBar={fakeSearchBar}
          onClick={this.clickSearch}
        />
        {(this.props.breakpoint !== 'large' && (
          <SearchModal
            selectedTab={this.state.selectedTab}
            modalIsOpen={this.state.modalIsOpen}
            closeModal={this.closeModal}
          >{this.getContent()}</SearchModal>)) ||
          (
          <SearchModalLarge
            selectedTab={this.state.selectedTab}
            modalIsOpen={this.state.modalIsOpen}
            closeModal={this.closeModal}
          >{this.getContent()}</SearchModalLarge>)}
      </div>);
  }
}

const SearchMainContainerWithBreakpoint =
    getContext({ breakpoint: React.PropTypes.string.isRequired })(SearchMainContainer);

export default SearchMainContainerWithBreakpoint;

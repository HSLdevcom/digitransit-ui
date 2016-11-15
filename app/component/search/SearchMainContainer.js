import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import Tab from 'material-ui/Tabs/Tab';
import cx from 'classnames';

import { setEndpoint, setUseCurrent } from '../../action/EndpointActions';
import FakeSearchBar from './FakeSearchBar';
import { default as FakeSearchWithButton } from './FakeSearchWithButton';
import GeolocationOrInput from './GeolocationOrInput';
import SearchModal from './SearchModal';
import SearchModalLarge from './SearchModalLarge';

class SearchMainContainer extends React.Component {
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getStore: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    breakpoint: React.PropTypes.string.isRequired,
  };

  static propTypes = {
    className: React.PropTypes.string,
  }

  state = {
    selectedTab: 'destination',
    modalIsOpen: false,
  };

  componentDidMount() {
    this.context.getStore('SearchStore').addChangeListener(this.onSearchChange);
  }

  componentWillUnmount() {
    this.context.getStore('SearchStore').removeChangeListener(this.onSearchChange);
  }

  onSearchChange = payload => payload.action === 'open' && this.openDialog(payload.data);

  onTabChange = tab => this.changeToTab(tab.props.value)

  onSuggestionSelected = (name, item) => {
    if (item.properties.link) {
      this.context.router.push(item.properties.link);
    } else if (item.type === 'CurrentLocation') {
      this.context.executeAction(setUseCurrent, { target: this.state.selectedTab });
    } else {
      this.context.executeAction(setEndpoint, {
        target: this.state.selectedTab,
        endpoint: {
          lat: item.geometry.coordinates[1],
          lon: item.geometry.coordinates[0],
          address: name,
        },
      });
    }

    this.closeModal();
  }

  searchInputs = [];

  clickSearch = () => {
    const origin = this.context.getStore('EndpointStore').getOrigin();
    const geolocation = this.context.getStore('PositionStore').getLocationState();
    const hasOrigin = origin.lat || (origin.useCurrentPosition && geolocation.hasLocation);

    this.openDialog(hasOrigin ? 'destination' : 'origin');
  }

  openDialog(tab) {
    this.setState({ modalIsOpen: true });
    this.changeToTab(tab);
  }

  focusInput = value => (
    // this.searchInputs[value].searchInput is a hack
    this.searchInputs[value].searchInput.autowhatever.input.focus()
  )

  closeModal = () => this.setState({ modalIsOpen: false })

  changeToTab(tabname) {
    this.setState({
      selectedTab: tabname,
    }, () => {
      // Cannot use setTimeout for the focus, or iOS Safari won't show the caret.
      // Other browsers don't seem to care one way or another.
      this.focusInput(tabname);
    });
  }

  renderEndpointTab = (tabname, tablabel, type, endpoint) => (
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
        useCurrentPosition={endpoint.useCurrentPosition}
        initialValue={endpoint.address}
        type={type}
        close={this.closeModal}
        onSuggestionSelected={this.onSuggestionSelected}
      />
    </Tab>
  );

  render() {
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

    const Component = this.context.breakpoint === 'large' ? SearchModalLarge : SearchModal;

    return (
      <div
        className={cx(
          'fake-search-container', `bp-${this.context.breakpoint}`, this.props.className
        )}
      >
        <FakeSearchWithButton fakeSearchBar={fakeSearchBar} onClick={this.clickSearch} />
        <Component
          selectedTab={this.state.selectedTab}
          modalIsOpen={this.state.modalIsOpen}
          closeModal={this.closeModal}
        >
          {this.renderEndpointTab(
            'origin',
            <FormattedMessage id="origin" defaultMessage="Origin" />,
            'endpoint',
            this.context.getStore('EndpointStore').getOrigin()
          )}
          {this.renderEndpointTab(
            'destination',
            <FormattedMessage id="search" defaultMessage="Search" />,
            'all',
            this.context.getStore('EndpointStore').getDestination(),
          )}
        </Component>
      </div>
    );
  }
}

export default SearchMainContainer;

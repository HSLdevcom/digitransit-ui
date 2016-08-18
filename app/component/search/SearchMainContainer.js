import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Tab from 'material-ui/Tabs/Tab';

import { setEndpoint, setUseCurrent } from '../../action/EndpointActions';
import { executeSearch } from '../../action/SearchActions';
import FakeSearchBar from './FakeSearchBar';
import FakeSearchWithButton from './FakeSearchWithButton';
import GeolocationOrInput from './GeolocationOrInput';
import SearchModal from './SearchModal';

class SearchMainContainer extends React.Component {
  constructor() {
    super(...arguments);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.focusInput = this.focusInput.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.clickSearch = this.clickSearch.bind(this);
    this.render = this.render.bind(this);

    this.state = {
      selectedTab: "destination",
      modalIsOpen: false
    };
  }

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getStore: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    intl: intlShape.isRequired
  };

  componentWillMount() {
    return this.context.getStore("SearchStore").addChangeListener(this.onSearchChange);
  }

  componentWillUnmount() {
    return this.context.getStore("SearchStore").removeChangeListener(this.onSearchChange);
  }

  onSearchChange(payload) {
    if (payload.action === "open") {
      return this.openDialog(payload.data);
    }
  }

  onTabChange(tab) {
    return this.setState({
      selectedTab: tab.props.value
    }, () => {
      let ref1;
      let ref;

      if (tab.props.value === "origin") {
        this.context.executeAction(executeSearch, {
          input: ((ref = this.context.getStore("EndpointStore").getOrigin()) != null ? ref.address : void 0) || "",
          type: "endpoint"
        });
      }

      if (tab.props.value === "destination") {
        this.context.executeAction(executeSearch, {
          input: ((ref1 = this.context.getStore("EndpointStore").getDestination()) != null ? ref1.address : void 0) || "",
          type: "endpoint"
        });
      }

      if (tab.props.value === "search") {
        this.context.executeAction(executeSearch, {
          input: "",
          type: "search"
        });
      }

      return setTimeout(() => {
        return this.focusInput(tab.props.value);
      }, 0);
    });
  }

  closeModal() {
    return this.setState({
      modalIsOpen: false
    });
  }

  focusInput(value) {
    let ref2;
    let ref1;
    let ref;
    return (ref = this.refs[`searchInput${value}`]) != null ? (ref1 = ref.refs.searchInput.refs.autowhatever) != null ? (ref2 = ref1.refs.input) != null ? ref2.focus() : void 0 : void 0 : void 0;
  }

  openDialog(tab, cb) {
    return this.setState({
      selectedTab: tab,
      modalIsOpen: true
    }, function () {
      if (cb) {
        return cb();
      }
    });
  }

  clickSearch() {
    let ref;
    const geolocation = this.context.getStore("PositionStore").getLocationState();
    const origin = this.context.getStore("EndpointStore").getOrigin();
    const tab = (origin.lat || origin.useCurrentPosition) && geolocation.hasLocation ? "destination" : "origin";

    this.openDialog(tab, () => {
      return this.focusInput((origin.lat || origin.useCurrentPosition) && geolocation.hasLocation ? "destination" : "origin");
    });

    if ((origin.lat || origin.useCurrentPosition) && geolocation.hasLocation) {
      return this.context.executeAction(executeSearch, {
        input: ((ref = this.context.getStore("EndpointStore").getDestination()) != null ? ref.address : void 0) || "",
        type: "endpoint"
      });
    } else {
      return this.context.executeAction(executeSearch, {
        input: "",
        type: "endpoint"
      });
    }
  }

  render() {
    const origin = this.context.getStore("EndpointStore").getOrigin();
    const destination = this.context.getStore("EndpointStore").getDestination();

    const originSearchTabLabel = this.context.intl.formatMessage({
      id: "origin",
      defaultMessage: "Origin"
    });

    const destinationSearchTabLabel = this.context.intl.formatMessage({
      id: "destination",
      defaultMessage: "destination"
    });

    const searchTabLabel = this.context.intl.formatMessage({
      id: "search",
      defaultMessage: "SEARCH"
    });

    const destinationPlaceholder = this.context.intl.formatMessage({
      id: "destination-placeholder",
      defaultMessage: "Where to? - address or stop"
    });

    const fakeSearchBar = <FakeSearchBar onClick={this.clickSearch} placeholder={destinationPlaceholder} id="front-page-search-bar" />;

    return <div><FakeSearchWithButton fakeSearchBar={fakeSearchBar} onClick={this.clickSearch} /><SearchModal selectedTab={this.state.selectedTab} modalIsOpen={this.state.modalIsOpen} closeModal={this.closeModal}><Tab className={`search-header__button${this.state.selectedTab === "origin" ? "--selected" : ""}`} label={originSearchTabLabel} value="origin" id="origin" onActive={this.onTabChange}><GeolocationOrInput ref="searchInputorigin" id="search-origin" endpoint={this.context.getStore("EndpointStore").getOrigin()} type="endpoint" onSuggestionSelected={(name, item) => {
            if (item.type === "CurrentLocation") {
              this.context.executeAction(setUseCurrent, "origin");
            } else {
              this.context.executeAction(setEndpoint, {
                "target": "origin",

                "endpoint": {
                  lat: item.geometry.coordinates[1],
                  lon: item.geometry.coordinates[0],
                  address: name
                }
              });
            }

            return this.closeModal();
          }} /></Tab><Tab className={`search-header__button${this.state.selectedTab === "destination" ? "--selected" : ""}`} label={destinationSearchTabLabel} value="destination" id="destination" onActive={this.onTabChange}><GeolocationOrInput ref="searchInputdestination" endpoint={this.context.getStore("EndpointStore").getDestination()} id="search-destination" type="endpoint" onSuggestionSelected={(name, item) => {
            if (item.type === "CurrentLocation") {
              this.context.executeAction(setUseCurrent, "destination");
            } else {
              this.context.executeAction(setEndpoint, {
                "target": "destination",

                "endpoint": {
                  lat: item.geometry.coordinates[1],
                  lon: item.geometry.coordinates[0],
                  address: name
                }
              });
            }

            return this.closeModal();
          }} /></Tab><Tab className={`search-header__button${this.state.selectedTab === "search" ? "--selected" : ""}`} label={searchTabLabel} value="search" id="search-button" onActive={this.onTabChange}><GeolocationOrInput ref="searchInputsearch" initialValue="" id="search" type="search" onSuggestionSelected={(name, item) => {
            if (item.properties.link) {
              this.context.router.push(item.properties.link);
            }

            return this.closeModal();
          }} /></Tab></SearchModal></div>;
  }
}

export default SearchMainContainer;

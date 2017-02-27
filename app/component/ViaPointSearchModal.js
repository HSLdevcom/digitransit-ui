import React from 'react';
import Tab from 'material-ui/Tabs/Tab';
import { intlShape } from 'react-intl';
import cx from 'classnames';


import { getAllEndpointLayers } from '../util/searchUtils';
import { locationToOTP } from '../util/otpStrings';
import SearchInputContainer from './SearchInputContainer';
import SearchModal from './SearchModal';
import SearchModalLarge from './SearchModalLarge';

class ViaPointSearchModal extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    router: React.PropTypes.object,
    location: React.PropTypes.object,
    breakpoint: React.PropTypes.string.isRequired,
  };

  componentDidUpdate() {
    if (this.modalIsOpen() && this.searchInputContainer) {
      this.searchInputContainer.autowhatever.input.focus();
    }
  }

  onSuggestionSelected = (name, item) => {
    this.context.router.replace({
      ...this.context.location,
      state: {
        ...this.context.location.state,
        viaPointSearchModalOpen: false,
      },
      query: {
        ...this.context.location.query,
        intermediatePlaces: locationToOTP({
          lat: item.geometry.coordinates[1],
          lon: item.geometry.coordinates[0],
          address: name,
        }),
      },
    });
    setTimeout(this.context.router.go, 0, this.context.location.state.viaPointSearchModalOpen * -1);
  };

  modalIsOpen = () => (
    this.context.location.state ?
      Boolean(this.context.location.state.viaPointSearchModalOpen) : false
  )

  render() {
    if (!this.modalIsOpen()) {
      return false;
    }

    let label = this.context.intl.formatMessage({
      id: 'via-point',
      defaultMessage: 'Via point',
    });

    label = label.charAt(0).toUpperCase() + label.slice(1);
    let searchTabLabel;
    let Component;
    let responsiveClass = '';
    let placeholder;

    if (this.context.breakpoint === 'large') {
      Component = SearchModalLarge;
      responsiveClass = 'bp-large';
      searchTabLabel = '';
      placeholder = label;
    } else {
      Component = SearchModal;
      searchTabLabel = label;
    }

    return (
      <div className={cx('onetab-search-modal-container', 'via-point-modal', responsiveClass)}>
        <div className={cx('fake-search-container', responsiveClass)}>
          <Component
            selectedTab="tab"
            modalIsOpen
            closeModal={this.context.router.goBack}
          >
            <Tab className="search-header__button--selected" label={searchTabLabel} value="tab">
              <SearchInputContainer
                ref={(c) => { this.searchInputContainer = c; }}
                placeholder={placeholder}
                type="endpoint"
                layers={getAllEndpointLayers()}
                onSuggestionSelected={this.onSuggestionSelected}
                close={this.context.router.goBack}
              />
            </Tab>
          </Component>
        </div>
      </div>
    );
  }
}

export default ViaPointSearchModal;

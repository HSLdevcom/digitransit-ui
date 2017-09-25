import PropTypes from 'prop-types';
import React from 'react';
import Tab from 'material-ui/Tabs/Tab';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import { routerShape } from 'react-router';
import SearchInputContainer from './SearchInputContainer';
import { setUseCurrent } from '../action/EndpointActions';
import SearchModal from './SearchModal';
import SearchModalLarge from './SearchModalLarge';
import { getPathWithEndpoints } from '../util/path';
import { locationToOTP } from '../util/otpStrings';

class OneTabSearchModal extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    router: routerShape,
    location: PropTypes.object,
    breakpoint: PropTypes.string.isRequired,
  };

  static propTypes = {
    customOnSuggestionSelected: PropTypes.func,
    customTabLabel: PropTypes.string,
    target: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    layers: PropTypes.array,
    responsive: PropTypes.bool, // a switch to force use of fullscreen modal
  };

  componentDidUpdate() {
    if (this.modalIsOpen() && this.searchInputContainer) {
      this.searchInputContainer.focus();
    }
  }

  onSuggestionSelected = (name, item) => {
    const newLocation = {
      ...this.context.location,
      state: {
        ...this.context.location.state,
        oneTabSearchModalOpen: false,
      },
    };

    if (item.type === 'CurrentLocation') {
      this.context.executeAction(setUseCurrent, {
        target: this.props.target,
        router: this.context.router,
        location: newLocation,
      });
    } else {
      let [, , origin, destination] = this.context.location.pathname.split('/');

      const location = {
        lat: item.geometry.coordinates[1],
        lon: item.geometry.coordinates[0],
        address: name,
      };

      if (this.props.target === 'destination') {
        destination = locationToOTP(location);
      } else {
        origin = locationToOTP(location);
      }
      const url = `${getPathWithEndpoints(origin, destination)}`;
      this.context.router.replace(url);
    }
  };

  modalIsOpen = () =>
    this.context.location.state
      ? Boolean(this.context.location.state.oneTabSearchModalOpen)
      : false;

  render() {
    if (!this.modalIsOpen()) {
      return false;
    }

    let label = this.props.customTabLabel
      ? this.props.customTabLabel
      : this.context.intl.formatMessage({
          id: this.props.target || 'Origin',
          defaultMessage: this.props.target || 'Origin',
        });

    label = label.charAt(0).toUpperCase() + label.slice(1);
    let searchTabLabel;
    let Component;
    let responsiveClass = '';
    let placeholder;

    if (this.context.breakpoint === 'large' && this.props.responsive) {
      Component = SearchModalLarge;
      responsiveClass = 'bp-large';
      searchTabLabel = '';
      placeholder = label;
    } else {
      Component = SearchModal;
      searchTabLabel = label;
    }

    return (
      <div className={cx('onetab-search-modal-container', responsiveClass)}>
        <div className={cx('fake-search-container', responsiveClass)}>
          <Component
            selectedTab="tab"
            modalIsOpen
            closeModal={this.context.router.goBack}
          >
            <Tab
              className="search-header__button--selected"
              label={searchTabLabel}
              value="tab"
            >
              <SearchInputContainer
                ref={c => {
                  this.searchInputContainer = c;
                }}
                placeholder={placeholder}
                type="endpoint"
                layers={this.props.layers}
                onSuggestionSelected={
                  this.props.customOnSuggestionSelected ||
                  this.onSuggestionSelected
                }
                close={this.context.router.goBack}
              />
            </Tab>
          </Component>
        </div>
      </div>
    );
  }
}

export default OneTabSearchModal;

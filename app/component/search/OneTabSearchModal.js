import React from 'react';
import Tab from 'material-ui/Tabs/Tab';
import { intlShape } from 'react-intl';

import GeolocationOrInput from './GeolocationOrInput';
import { setEndpoint, setUseCurrent } from '../../action/EndpointActions';
import { executeSearch } from '../../action/SearchActions';
import SearchModal from './SearchModal';


class OneTabSearchModal extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    closeModal: React.PropTypes.func.isRequired,
    customOnSuggestionSelected: React.PropTypes.func,
    customTabLabel: React.PropTypes.string,
    endpoint: React.PropTypes.object,
    initialValue: React.PropTypes.string.isRequired,
    modalIsOpen: React.PropTypes.oneOfType(
      [React.PropTypes.bool, React.PropTypes.string]).isRequired,
    target: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),
  };

  componentDidUpdate() {
    if (this.props.modalIsOpen) {
      setTimeout(() => this.geolocationOrInput.searchInput.autowhatever.input.focus(),
                 0);

      if (!this.props.endpoint) {
        this.context.executeAction(executeSearch, {
          input: '',
          type: 'endpoint',
        });
      } else if (this.props.target === 'origin') {
        this.context.executeAction(executeSearch, {
          input: this.context.getStore('EndpointStore').getOrigin().address || '',
          type: 'endpoint',
        });
      } else if (this.props.target === 'destination') {
        this.context.executeAction(executeSearch, {
          input: this.context.getStore('EndpointStore').getDestination().address || '',
          type: 'endpoint',
        });
      }
    }
  }

  onSuggestionSelected = (name, item) => {
    if (item.type === 'CurrentLocation') {
      this.context.executeAction(setUseCurrent, this.props.target);
    } else {
      this.context.executeAction(setEndpoint, {
        target: this.props.target,
        endpoint: {
          lat: item.geometry.coordinates[1],
          lon: item.geometry.coordinates[0],
          address: name,
        },
      });
    }

    return this.props.closeModal();
  };

  render() {
    const searchTabLabel = (this.props.customTabLabel ?
      this.props.customTabLabel :
      this.context.intl.formatMessage({
        id: this.props.target || 'origin',
        defaultMessage: this.props.target || 'origin',
      }));

    return (
      <SearchModal
        selectedTab="tab"
        modalIsOpen={this.props.modalIsOpen}
        closeModal={this.props.closeModal}
      >
        <Tab className="search-header__button--selected" label={searchTabLabel} value="tab">
          <GeolocationOrInput
            ref={(c) => { this.geolocationOrInput = c; }}
            useCurrentPosition={this.props.endpoint && this.props.endpoint.useCurrentPosition}
            initialValue={this.props.initialValue}
            type="endpoint"
            onSuggestionSelected={
              this.props.customOnSuggestionSelected || this.onSuggestionSelected}
          />
        </Tab>
      </SearchModal>);
  }
}

export default OneTabSearchModal;

import PropTypes from 'prop-types';
import React from 'react';
import uniqBy from 'lodash/uniqBy';
import { intlShape } from 'react-intl';
import SearchSettingsDropdown from './SearchSettingsDropdown';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { saveRoutingSettings } from '../action/SearchSettingsActions';

class FareZoneSelector extends React.Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    currentOption: PropTypes.string.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  createFareZoneObjects = options => {
    const { intl, config } = this.context;
    const constructedOptions = options.map(o => ({
      displayName: config.fareMapping(o),
      value: o,
    }));
    constructedOptions.push({
      displayName: 'none',
      displayNameObject: intl.formatMessage({
        defaultMessage: 'ticket-type-none',
        id: 'ticket-type-none',
      }),
      value: 'none',
    });
    return uniqBy(constructedOptions, 'value');
  };

  render() {
    const { options, currentOption } = this.props;
    const { intl } = this.context;
    const mappedOptions = this.createFareZoneObjects(options);
    return (
      <div className="settings-option-container">
        <SearchSettingsDropdown
          labelText={intl.formatMessage({
            id: 'zones',
            defaultMessage: 'Fare zones',
          })}
          currentSelection={{
            title: currentOption,
            value: currentOption,
          }}
          options={mappedOptions}
          onOptionSelected={value => {
            this.context.executeAction(saveRoutingSettings, {
              ticketTypes: value,
            });
            addAnalyticsEvent({
              category: 'ItinerarySettings',
              action: 'ChangeFareZones',
              name: value,
            });
          }}
          displayValueFormatter={value =>
            value.split(':')[1] ? value.split(':')[1] : value
          }
        />
      </div>
    );
  }
}

export default FareZoneSelector;

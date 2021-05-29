import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { station as exampleStation } from '../../ExampleData';
import ComponentUsageExample from '../../ComponentUsageExample';
import OSMOpeningHours from '../popups/OSMOpeningHours';
import SidebarContainer from './SidebarContainer';
import DynamicParkingLots from '../tile-layer/DynamicParkingLots';

class DynamicParkingLotsContent extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
  };

  static description = (
    <div>
      <p>Renders a citybike popup.</p>
      <ComponentUsageExample description="">
        <DynamicParkingLotsContent
          context="context object here"
          station={exampleStation}
        >
          Im content of a citybike card
        </DynamicParkingLotsContent>
      </ComponentUsageExample>
    </div>
  );

  static displayName = 'ParkingLotPopup';

  static propTypes = {
    match: PropTypes.object,
  };

  getCapacity() {
    return (
      <div className="capacity">
        {this.getCarCapacity()}
        {this.getClosed()}
        <br />
        {this.getWheelchairCapacity()}
      </div>
    );
  }

  getCarCapacity() {
    const { intl } = this.context;
    const { free, total } = this.props.match.location.query;

    if (Number(free)) {
      return intl.formatMessage(
        {
          id: 'parking-spaces-available',
          defaultMessage: '{free} of {total} parking spaces available',
        },
        { free, total },
      );
    }

    if (Number(total)) {
      return intl.formatMessage(
        {
          id: 'parking-spaces-in-total',
          defaultMessage: 'Capacity: {total} parking spaces',
        },
        { total },
      );
    }
    return null;
  }

  getClosed() {
    const { state } = this.props.match.location.query;
    if (state === 'closed') {
      return (
        <span>
          {' '}
          (<FormattedMessage id="closed" defaultMessage="closed" />)
        </span>
      );
    }
    return null;
  }

  getWheelchairCapacity() {
    const { freeDisabled, totalDisabled } = this.props.match.location.query;
    return freeDisabled !== undefined && totalDisabled !== undefined
      ? this.context.intl.formatMessage(
          {
            id: 'disabled-parking-spaces-available',
            defaultMessage:
              '{freeDisabled} of {totalDisabled} wheelchair-accessible parking spaces available',
          },
          { freeDisabled, totalDisabled },
        )
      : null;
  }

  getUrl() {
    const { intl } = this.context;
    const { url } = this.props.match.location.query;
    if (url) {
      return (
        <div className="padding-vertical-small">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage({
              id: 'extra-info',
              defaultMessage: 'More information',
            })}
          </a>
        </div>
      );
    }
    return null;
  }

  getNotes() {
    const currentLanguage = this.context.intl.locale;
    const { notes } = this.props.match.location.query;
    if (notes) {
      const parsedNotes = JSON.parse(notes);
      return (
        <div className="large-text padding-vertical-small">
          {parsedNotes[currentLanguage] || null}
        </div>
      );
    }
    return null;
  }

  renderOpeningHours() {
    const { openingHours } = this.props.match.location.query;
    if (openingHours) {
      return <OSMOpeningHours openingHours={openingHours} displayStatus />;
    }
    return null;
  }

  render() {
    const { lat, lng, name, lotType } = this.props.match.location.query;
    return (
      <SidebarContainer
        icon={`icon-icon_${DynamicParkingLots.getIcon(lotType)}`}
        name={name}
        location={{
          address: name,
          lat: Number(lat),
          lon: Number(lng),
        }}
      >
        <div className="card dynamic-parking-lot-popup">
          {this.getCapacity()}
          {this.getNotes()}
          <div>
            {this.renderOpeningHours()}
            {this.getUrl()}
          </div>
        </div>
      </SidebarContainer>
    );
  }
}

DynamicParkingLotsContent.contextTypes = {
  intl: intlShape.isRequired,
};

export default DynamicParkingLotsContent;

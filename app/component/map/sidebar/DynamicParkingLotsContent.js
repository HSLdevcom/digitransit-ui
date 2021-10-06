import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import OSMOpeningHours from '../popups/OSMOpeningHours';
import SidebarContainer from './SidebarContainer';

export const getIcon = type => {
  if (type === 'Parkhaus' || type === 'Tiefgarage') {
    return 'covered_carpark';
  }
  if (type === 'Park-Ride') {
    return 'p+r';
  }
  if (type === 'Park-Carpool') {
    return 'carpark_carpool';
  }
  if (type === 'Wohnmobilparkplatz') {
    return 'caravan';
  }
  if (type === 'Barrierefreier-Parkplatz') {
    return 'barrierefrei';
  }
  if (type === 'Parkplatz') {
    return 'open_carpark';
  }
  return 'p+r';
};

class DynamicParkingLotsContent extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
  };

  static displayName = 'ParkingLotPopup';

  static propTypes = {
    vehicleParking: PropTypes.any,
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
    const free = this.props.vehicleParking.availability?.carSpaces;
    const total = this.props.vehicleParking.capacity?.carSpaces;

    if (Number(free) || Number(free) === 0) {
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
    const { state } = this.props.vehicleParking.tags;
    if (state === 'TEMPORARILY_CLOSED' || state === 'CLOSED') {
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
    const freeDisabled = this.props.vehicleParking.availability
      ?.wheelchairAccessibleCarSpaces;
    const totalDisabled = this.props.vehicleParking.capacity
      ?.wheelchairAccessibleCarSpaces;
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
    const { detailsUrl } = this.props.vehicleParking;
    if (detailsUrl) {
      return (
        <div className="padding-vertical-small">
          <a href={detailsUrl} target="_blank" rel="noopener noreferrer">
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

  renderOpeningHours() {
    const { openingHours } = this.props.vehicleParking;
    if (openingHours) {
      return <OSMOpeningHours openingHours={openingHours} displayStatus />;
    }
    return null;
  }

  render() {
    const { lat, lon, name, note } = this.props.vehicleParking;

    const tags = this.props.vehicleParking.tags.reduce((newTags, tag) => {
      return { ...newTags, [tag.split(':')[0]]: tag.split(':')[1] };
    }, {});
    const lotType = tags.lot_type;

    return (
      <SidebarContainer
        icon={`icon-icon_${getIcon(lotType)}`}
        name={name}
        location={{
          address: name,
          lat: Number(lat),
          lon: Number(lon),
        }}
      >
        <div className="card dynamic-parking-lot-popup">
          {this.getCapacity()}
          {note && (
            <div className="large-text padding-vertical-small">{note}</div>
          )}
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

const containerComponent = createFragmentContainer(DynamicParkingLotsContent, {
  vehicleParking: graphql`
    fragment DynamicParkingLotsContent_vehicleParking on VehicleParking {
      vehicleParkingId
      name
      lon
      lat
      capacity {
        carSpaces
        wheelchairAccessibleCarSpaces
      }
      availability {
        carSpaces
        wheelchairAccessibleCarSpaces
      }
      tags
      note
      detailsUrl
      openingHours
    }
  `,
});

export {
  containerComponent as default,
  DynamicParkingLotsContent as Component,
};

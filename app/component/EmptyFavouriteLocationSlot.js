import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

const EmptyFavouriteLocationSlot = ({ index }) => (
  <Link
    id={`add-new-favourite-${index}`}
    to="/suosikki/uusi"
    className="cursor-pointer no-decoration"
  >
    <div className="new-favourite-button-content">
      <Icon img="icon-icon_plus" className="add-new-favourite-icon" />
      <p className="add-location-text">
        <FormattedMessage id="add-location" defaultMessage="Add location" />
      </p>
    </div>
  </Link>);

EmptyFavouriteLocationSlot.displayName = 'EmptyFavouriteLocationSlot';

EmptyFavouriteLocationSlot.description = () =>
  <div>
    <p>Renders a empty favourite location slot component</p>
    <ComponentUsageExample description="none">
      <EmptyFavouriteLocationSlot />
    </ComponentUsageExample>
  </div>;

EmptyFavouriteLocationSlot.propTypes = {
  index: React.PropTypes.number.isRequired,
};


export default EmptyFavouriteLocationSlot;

import React from 'react';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';
import Icon from '../icon/icon';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

const EmptyFavouriteLocationSlot = () => (
  <Link
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


EmptyFavouriteLocationSlot.description = (
  <div>
    <p>Renders a empty favourite location slot component</p>
    <ComponentUsageExample description="none">
      <EmptyFavouriteLocationSlot />
    </ComponentUsageExample>
  </div>
);


export default EmptyFavouriteLocationSlot;

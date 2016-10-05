import React from 'react';
import cx from 'classnames';
import FavouritesTabLabelContainer from './FavouritesTabLabelContainer';
import NearbyTabLabelContainer from './NearbyTabLabelContainer';

const FrontPagePanelLarge = ({ selectedPanel, nearbyClicked,
   favouritesClicked, children, floating }) => {
  // let panel;
  const tabClasses = ['small-6', 'h4', 'hover'];
  const nearbyClasses = ['nearby-routes'];
  const favouritesClasses = ['favourites'];

  if (selectedPanel === 1) {
    nearbyClasses.push('selected');
  } else {
    favouritesClasses.push('selected');
  }

  return (
    <div className={`fpcfloat ${floating === 'yes' ? 'floating' : ''} no-select`}>
      <ul className="tabs-row bp-large cursor-pointer">
        <NearbyTabLabelContainer
          classes={cx(tabClasses, nearbyClasses)}
          onClick={nearbyClicked}
        />
        <FavouritesTabLabelContainer
          classes={cx(tabClasses, favouritesClasses)}
          onClick={favouritesClicked}
        />
      </ul>
      {children}
    </div>
); };

FrontPagePanelLarge.propTypes = {
  selectedPanel: React.PropTypes.number,
  nearbyClicked: React.PropTypes.func.isRequired,
  favouritesClicked: React.PropTypes.func.isRequired,
  children: React.PropTypes.node,
  floating: React.PropTypes.string.isRequired,
};

export default FrontPagePanelLarge;

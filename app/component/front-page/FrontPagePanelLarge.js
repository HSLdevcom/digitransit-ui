import React from 'react';
import cx from 'classnames';
import FavouritesPanel from '../favourites/FavouritesPanel';
import NearbyRoutesPanel from './NearbyRoutesPanel';
import FavouritesTabLabelContainer from './FavouritesTabLabelContainer';
import NearbyTabLabelContainer from './NearbyTabLabelContainer';

const FrontPagePanelLarge = ({ selectedPanel, nearbyClicked,
   favouritesClicked }) => {
  let panel;
  const tabClasses = ['small-6', 'h4', 'hover'];
  const nearbyClasses = ['nearby-routes'];
  const favouritesClasses = ['favourites'];

  if (selectedPanel === 1) {
    panel = <NearbyRoutesPanel />;
    nearbyClasses.push('selected');
  } else {
    panel = <FavouritesPanel className="white" />;
    favouritesClasses.push('selected');
  }

  const content = <div key="panel">{panel}</div>;

  return (
    <div className="fpcfloat no-select">
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
      {selectedPanel ? content : undefined}
    </div>
); };

FrontPagePanelLarge.propTypes = {
  selectedPanel: React.PropTypes.number.isRequired,
  nearbyClicked: React.PropTypes.func.isRequired,
  favouritesClicked: React.PropTypes.func.isRequired,
};


export default FrontPagePanelLarge;

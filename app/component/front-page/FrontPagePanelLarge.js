import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import Icon from '../icon/icon';
import FavouritesPanel from '../favourites/FavouritesPanel';
import NearbyRoutesPanel from './NearbyRoutesPanel';
import FavouritesTabLabelContainer from './FavouritesTabLabelContainer';
import NearbyTabLabelContainer from './NearbyTabLabelContainer';

const FrontPagePanelLarge = ({ selectedPanel, nearbyClicked,
   favouritesClicked, closePanel }) => {
  let heading;
  let panel;
  const tabClasses = ['small-6', 'h4', 'hover'];
  const nearbyClasses = ['nearby-routes'];
  const favouritesClasses = ['favourites'];

  if (selectedPanel === 1) {
    panel = <NearbyRoutesPanel />;
    heading = <FormattedMessage id="near-you" defaultMessage="Near you" />;
    nearbyClasses.push('selected');
  } else {
    panel = <FavouritesPanel />;
    heading = <FormattedMessage id="your-favourites" defaultMessage="Your favourites" />;
    favouritesClasses.push('selected');
  }

  const top = (
    <div className="panel-top">
      <div className="panel-heading">
        <h2>e</h2>
      </div>
    </div>
  );

  const content = <div key="panel">{top}{panel}</div>;

  return (
    <div className="fpcfloat no-select">
      <ul className="tabs-row tabs-arrow-up cursor-pointer">
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

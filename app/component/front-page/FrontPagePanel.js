import React from 'react';
import cx from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { FormattedMessage } from 'react-intl';
import Icon from '../icon/icon';
import FavouritesPanel from '../favourites/FavouritesPanel';
import NearbyRoutesPanel from './NearbyRoutesPanel';
import FavouritesTabLabelContainer from './FavouritesTabLabelContainer';
import NearbyTabLabelContainer from './NearbyTabLabelContainer';

const FrontPagePanel = ({ selectedPanel, nearbyClicked,
   favouritesClicked, closePanel, children }) => {
  console.log('children', children);
  let heading;
  let panel;
  const tabClasses = ['small-6', 'h4', 'hover'];
  const nearbyClasses = ['nearby-routes'];
  const favouritesClasses = ['favourites'];

  if (selectedPanel === 1) {
    heading = <FormattedMessage id="near-you" defaultMessage="Near you" />;
    nearbyClasses.push('selected');
  } else if (selectedPanel === 2) {
    heading = <FormattedMessage id="your-favourites" defaultMessage="Your favourites" />;
    favouritesClasses.push('selected');
  }

  const top = (
    <div className="panel-top">
      <div className="panel-heading">
        <h2>{heading}</h2>
      </div>
      <div className="close-icon" onClick={closePanel}>
        <Icon img="icon-icon_close" />
      </div>
    </div>
  );

  const content = <div className="frontpage-panel-wrapper" key="panel">{top}{children}</div>;

  return (
    <div className="frontpage-panel-container no-select">
      <ReactCSSTransitionGroup
        transitionName="frontpage-panel-wrapper"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
      >
      {selectedPanel ? content : undefined}
      </ReactCSSTransitionGroup>
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
    </div>
); };

FrontPagePanel.propTypes = {
  selectedPanel: React.PropTypes.number.isRequired,
  nearbyClicked: React.PropTypes.func.isRequired,
  favouritesClicked: React.PropTypes.func.isRequired,
  closePanel: React.PropTypes.func.isRequired,
  children: React.PropTypes.node,
};


export default FrontPagePanel;

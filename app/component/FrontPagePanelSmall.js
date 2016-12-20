import React from 'react';
import cx from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import NearbyTabLabel from './NearbyTabLabel';
import FavouritesTabLabelContainer from './FavouritesTabLabelContainer';

const FrontPagePanelSmall = ({ selectedPanel, nearbyClicked,
   favouritesClicked, closePanel, children }) => {
  let heading;
  const tabClasses = ['hover'];
  const nearbyClasses = ['nearby-routes', 'h4'];
  const favouritesClasses = ['favourites', 'h4'];

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

  const content = selectedPanel ?
    <div className="frontpage-panel-wrapper" key="panel">{top}{children}</div> : undefined;

  return (
    <div className="frontpage-panel-container no-select">
      <ReactCSSTransitionGroup
        transitionName="frontpage-panel-wrapper"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
      >
        {content}
      </ReactCSSTransitionGroup>
      <ul className="tabs-row cursor-pointer">
        <NearbyTabLabel
          classes={cx(tabClasses, nearbyClasses)}
          onClick={nearbyClicked}
        />
        <FavouritesTabLabelContainer
          classes={cx(tabClasses, favouritesClasses)}
          onClick={favouritesClicked}
        />
      </ul>
    </div>
  );
};

const noop = () => {};

FrontPagePanelSmall.displayName = 'FrontPagePanelSmall';

FrontPagePanelSmall.description = () =>
  <div>
    <p>
      Front page tabs for small display.
    </p>
    <ComponentUsageExample description="Front page tabs">
      <FrontPagePanelSmall closePanel={noop} favouritesClicked={noop} nearbyClicked={noop} />
    </ComponentUsageExample>
  </div>;

FrontPagePanelSmall.propTypes = {
  selectedPanel: React.PropTypes.number,
  nearbyClicked: React.PropTypes.func.isRequired,
  favouritesClicked: React.PropTypes.func.isRequired,
  closePanel: React.PropTypes.func.isRequired,
  children: React.PropTypes.node,
};

export default FrontPagePanelSmall;

import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import NearbyTabLabel from './NearbyTabLabel';
import FavouritesTabLabelContainer from './FavouritesTabLabelContainer';

const FrontPagePanelSmall = ({
  selectedPanel,
  nearbyClicked,
  favouritesClicked,
  closePanel,
  panelExpanded,
  searchModalIsOpen,
  children,
}) => {
  let heading;
  const tabClasses = ['hover'];
  const nearbyClasses = ['nearby-routes', 'h4'];
  const favouritesClasses = ['favourites', 'h4'];

  if (selectedPanel === 1) {
    heading = <FormattedMessage id="near-you" defaultMessage="Near you" />;
    nearbyClasses.push('selected');
  } else if (selectedPanel === 2) {
    heading = (
      <FormattedMessage id="your-favourites" defaultMessage="Your favourites" />
    );
    favouritesClasses.push('selected');
  }

  const content = selectedPanel
    ? <div
        className={cx(['frontpage-panel-wrapper', 'no-select'], {
          'expanded-panel': panelExpanded,
          'modal-open-panel': searchModalIsOpen,
        })}
        key="panel"
      >
        {children}
      </div>
    : undefined;

  return (
    <div className={cx(['frontpage-panel-container', 'no-select'])}>
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
      {content}
    </div>
  );
};

const noop = () => {};

FrontPagePanelSmall.displayName = 'FrontPagePanelSmall';

FrontPagePanelSmall.description = () =>
  <div>
    <p>Front page tabs for small display.</p>
    <ComponentUsageExample description="Front page tabs">
      <FrontPagePanelSmall
        closePanel={noop}
        favouritesClicked={noop}
        nearbyClicked={noop}
      />
    </ComponentUsageExample>
  </div>;

FrontPagePanelSmall.propTypes = {
  selectedPanel: PropTypes.number,
  nearbyClicked: PropTypes.func.isRequired,
  favouritesClicked: PropTypes.func.isRequired,
  closePanel: PropTypes.func.isRequired,
  panelExpanded: PropTypes.bool.isRequired,
  searchModalIsOpen: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

export default FrontPagePanelSmall;

import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';
import NearbyTabLabel from './NearbyTabLabel';
import FavouritesTabLabelContainer from './FavouritesTabLabelContainer';

const FrontPagePanelSmall = ({
  selectedPanel,
  nearbyClicked,
  favouritesClicked,
  mapExpanded,
  children,
  //  location,
}) => {
  const tabClasses = ['hover'];
  const nearbyClasses = ['nearby-routes', 'h4'];
  const favouritesClasses = ['favourites', 'h4'];

  if (selectedPanel === 1) {
    nearbyClasses.push('selected');
  } else {
    favouritesClasses.push('selected');
  }

  const content = selectedPanel && (
    <div
      className={cx([
        'frontpage-panel-wrapper',
        'no-select',
        'small',
        { 'expanded-panel': mapExpanded },
      ])}
      key="panel"
    >
      {children}
    </div>
  );

  return (
    <div
      className={cx(['frontpage-panel-container', 'no-select'], {
        expanded: mapExpanded,
      })}
    >
      <ul
        className={cx([
          'tabs-row',
          'cursor-pointer',
          {
            expanded: mapExpanded,
          },
        ])}
      >
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

FrontPagePanelSmall.description = () => (
  <div>
    <p>Front page tabs for small display.</p>
    <ComponentUsageExample description="Front page tabs">
      <FrontPagePanelSmall
        closePanel={noop}
        favouritesClicked={noop}
        nearbyClicked={noop}
      />
    </ComponentUsageExample>
  </div>
);

FrontPagePanelSmall.defaultProps = {
  selectedPanel: 1,
  children: null,
};

FrontPagePanelSmall.propTypes = {
  selectedPanel: PropTypes.oneOf([1, 2]),
  nearbyClicked: PropTypes.func.isRequired,
  favouritesClicked: PropTypes.func.isRequired,
  mapExpanded: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

export default FrontPagePanelSmall;

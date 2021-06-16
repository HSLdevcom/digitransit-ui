import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { routerShape } from 'found';
import CardHeader from '../../CardHeader';
import withBreakpoint from '../../../util/withBreakpoint';
import MarkerPopupBottom from '../MarkerPopupBottom';
import storeOrigin from '../../../action/originActions';
import storeDestination from '../../../action/destinationActions';
import { dtLocationShape } from '../../../util/shapes';

const SidebarContainer = (
  { location, name, description, icon, breakpoint, children, className },
  { router, executeAction },
) => {
  const isMobile = breakpoint !== 'large';

  const onSelectLocation = (item, id) => {
    if (item.type === 'FutureRoute') {
      router.push(item.properties.url);
    } else if (id === 'origin') {
      router.push('/');
      executeAction(storeOrigin, item);
    } else {
      router.push('/');
      executeAction(storeDestination, item);
    }
  };

  return (
    <div
      className={cx(
        'card',
        'sidebar-card',
        !isMobile && 'sidebar-card-desktop',
        'popup',
      )}
    >
      <div
        className={cx(
          isMobile ? 'padding-horizontal-large' : 'padding-horizontal-xlarge',
          className,
        )}
      >
        <CardHeader
          name={name}
          descClass="padding-vertical-small"
          unlinked
          className="sidebar-card-header"
          icon={icon}
          headingStyle="h1"
          description={description}
          showCardSubHeader={Boolean(description)}
          showBackButton={!isMobile}
        />
        {children}
        {location && (
          <div className="padding-vertical-normal">
            <MarkerPopupBottom
              onSelectLocation={onSelectLocation}
              location={location}
            />
          </div>
        )}
      </div>
    </div>
  );
};

SidebarContainer.propTypes = {
  location: dtLocationShape,
  name: PropTypes.string,
  description: PropTypes.string || PropTypes.node,
  icon: PropTypes.string,
  breakpoint: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

SidebarContainer.defaultProps = {
  location: null,
  icon: null,
  children: null,
  className: null,
  name: '',
  description: '',
};

SidebarContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: routerShape.isRequired,
};

export default withBreakpoint(SidebarContainer);

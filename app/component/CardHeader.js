import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import cx from 'classnames';
import { stopShape, configShape } from '../util/shapes';
import AddressRow from './AddressRow';
import Icon from './Icon';
import ZoneIcon from './ZoneIcon';
import SplitBars from './SplitBars';
import BackButton from './BackButton';
import { getZoneLabel } from '../util/legUtils';

export default function CardHeader(
  {
    className,
    children,
    headerIcon,
    headingStyle,
    name,
    stop,
    description,
    code,
    externalLink,
    icon,
    icons,
    unlinked,
    showBackButton,
    headerConfig,
    favouriteContainer,
    isTerminal,
  },
  { config },
) {
  const headerTitle = stop.name ? stop.name : name;
  return (
    <Fragment>
      <div className={cx('card-header', className)}>
        {showBackButton && (
          <BackButton
            icon="icon-icon_arrow-collapse--left"
            iconClassName="arrow-icon"
          />
        )}
        <div className="card-header-content">
          {icon ? (
            <div
              className="left"
              style={{ fontSize: 32, paddingRight: 10, height: 32 }}
            >
              <Icon img={icon} color={config.colors.primary} />
            </div>
          ) : null}
          <div className="card-header-wrapper">
            <h1 className={headingStyle}>
              {headerTitle !== description || headingStyle ? headerTitle : ''}
              {externalLink || null}
              {headerIcon}
              {unlinked ? null : <span className="link-arrow"> ›</span>}
            </h1>
            <div className="card-sub-header">
              <div className="card-name-container">
                <AddressRow
                  desc={description}
                  code={code}
                  isTerminal={isTerminal}
                />
              </div>
              {headerConfig &&
                config.zones.stops &&
                stop.zoneId &&
                stop.gtfsId &&
                config.feedIds.includes(stop.gtfsId.split(':')[0]) && (
                  <ZoneIcon
                    zoneId={getZoneLabel(stop.zoneId, config)}
                    showUnknown={false}
                  />
                )}
            </div>
          </div>
          {icons && icons.length ? <SplitBars>{icons}</SplitBars> : null}
          {favouriteContainer}
        </div>
      </div>
      {children}
    </Fragment>
  );
}

CardHeader.displayName = 'CardHeader';

CardHeader.propTypes = {
  className: PropTypes.string,
  headerIcon: PropTypes.node,
  headingStyle: PropTypes.string,
  stop: stopShape.isRequired,
  description: PropTypes.string.isRequired,
  code: PropTypes.string,
  externalLink: PropTypes.node,
  icon: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
  children: PropTypes.node,
  unlinked: PropTypes.bool,
  showBackButton: PropTypes.bool,
  headerConfig: PropTypes.bool,
  favouriteContainer: PropTypes.element,
  name: PropTypes.string,
  isTerminal: PropTypes.bool,
};

CardHeader.defaultProps = {
  headerIcon: undefined,
  favouriteContainer: undefined,
  className: '',
  headingStyle: undefined,
  code: undefined,
  externalLink: undefined,
  icon: undefined,
  icons: undefined,
  children: undefined,
  unlinked: false,
  showBackButton: false,
  headerConfig: false,
  name: undefined,
  isTerminal: false,
};

CardHeader.contextTypes = {
  config: configShape.isRequired,
};

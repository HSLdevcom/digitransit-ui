import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import ZoneIcon from './ZoneIcon';
import SplitBars from './SplitBars';
import Favourite from './Favourite';
import BackButton from './BackButton'; // DT-3472
import { getZoneLabelColor } from '../util/mapIconUtils';
import { getZoneLabel } from '../util/legUtils';

const CardHeader = (
  {
    className,
    children,
    headerIcon,
    headingStyle,
    stop,
    name,
    description,
    code,
    externalLink,
    icon,
    icons,
    unlinked,
    showBackButton, // DT-3472
    backButtonColor, // DT-3472
    headerConfig,
    favouriteContainer,
  },
  { config },
) => (
  <Fragment>
    <div className={cx('card-header', className)}>
      {showBackButton && (
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          color={backButtonColor}
          iconClassName="arrow-icon"
          urlToBack={config.URL.ROOTLINK}
        />
      )}
      <div className="card-header-content">
        {icon ? (
          <div
            className="left"
            style={{ fontSize: 32, paddingRight: 10, height: 32 }}
          >
            <Icon img={icon} />
          </div>
        ) : null}
        <div className="card-header-wrapper">
          <span className={headingStyle || 'h4'}>
            {stop.name}
            {name}
            {externalLink || null}
            {headerIcon}
            {unlinked ? null : <span className="link-arrow"> ›</span>}
          </span>
          <div className="card-sub-header">
            {description != null && description !== 'null' ? (
              <p className="card-sub-header-address">{description}</p>
            ) : null}
            {code != null ? <p className="card-code">{code}</p> : null}
            {headerConfig && headerConfig.showZone && stop.zoneId && (
              <ZoneIcon
                zoneId={getZoneLabel(stop.zoneId, config)}
                zoneIdFontSize="11px"
                zoneLabelColor={getZoneLabelColor(config)}
                zoneLabelHeight="15px"
                zoneLabelWidth="15px"
                zoneLabelLineHeight="15px"
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

const emptyFunction = () => {};
const exampleIcons = [
  <Favourite
    key="favourite"
    favourite={false}
    addFavourite={emptyFunction}
    deleteFavourite={emptyFunction}
    allowLogin={false}
  />,
];

CardHeader.displayName = 'CardHeader';

CardHeader.description = () => (
  <div>
    <p>
      Generic card header, which displays card name, description, favourite star
      and optional childs
    </p>
    <ComponentUsageExample description="">
      <CardHeader
        name="Testipysäkki"
        description="Testipysäkki 2"
        code="7528"
        icons={exampleIcons}
        headingStyle="header-primary"
      />
    </ComponentUsageExample>
  </div>
);

CardHeader.propTypes = {
  className: PropTypes.string,
  headerIcon: PropTypes.node,
  headingStyle: PropTypes.string,
  stop: PropTypes.object,
  description: PropTypes.string.isRequired,
  code: PropTypes.string,
  externalLink: PropTypes.node,
  icon: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
  children: PropTypes.node,
  unlinked: PropTypes.bool,
  showBackButton: PropTypes.bool, // DT-3472
  backButtonColor: PropTypes.string, // DT-3472
  headerConfig: PropTypes.object,
  favouriteContainer: PropTypes.element,
  name: PropTypes.string,
};

CardHeader.defaultProps = {
  headerIcon: undefined,
  stop: {},
  favouriteContainer: undefined,
  name: '',
};

CardHeader.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default CardHeader;

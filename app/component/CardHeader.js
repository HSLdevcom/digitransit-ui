import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import SplitBars from './SplitBars';
import Favourite from './Favourite';

const CardHeader = ({
  className,
  children,
  headingStyle,
  name,
  description,
  code,
  icon,
  icons,
  unlinked,
}) => (
  <div className={cx('card-header', className)}>
    {children}
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
        {name}{unlinked ? null : <span className="link-arrow"> ›</span>}
      </span>
      <div className="card-sub-header">
        {code != null ? <p className="card-code">{code}</p> : null}
        <p className="sub-header-h4">{description}</p>
      </div>
    </div>
    { icons ? (
      <SplitBars>{icons}</SplitBars>
    ) : null}
  </div>);

const emptyFunction = () => {};
const exampleIcons = [<Favourite key="favourite" favourite={false} addFavourite={emptyFunction} />];

CardHeader.displayName = 'CardHeader';

CardHeader.description = () =>
  <div>
    <p>
      Generic card header, which displays card name, description,
      favourite star and optional childs
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
  </div>;

CardHeader.propTypes = {
  className: React.PropTypes.string,
  headingStyle: React.PropTypes.string,
  name: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  code: React.PropTypes.string,
  icon: React.PropTypes.string,
  icons: React.PropTypes.arrayOf(React.PropTypes.node),
  children: React.PropTypes.node,
  unlinked: React.PropTypes.bool,
};

export default CardHeader;

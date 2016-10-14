import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import Icon from '../icon/icon';
import SplitBars from '../util/SplitBars';
import Favourite from '../favourites/Favourite';

const CardHeader = ({
  className,
  children,
  headingStyle,
  name,
  description,
  code,
  icon,
  icons,
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
    { icons ? (
      <div className="right">
        <SplitBars>{icons}</SplitBars>
      </div>
    ) : null}
    <span className={headingStyle || 'h4 link-color'}>
      {name}<span className="link-arrow"> ›</span>
    </span>
    <div className="card-sub-header">
      {code != null ? <p className="card-code">{code}</p> : null}
      <p className="sub-header-h4">{description}</p>
    </div>
  </div>);

const exampleIcons = [<Favourite favourite={false} />];

CardHeader.description = (
  <div>
    <p>
      {`Generic card header, which displays card name, description,\n
        favourite star and optional childs`}
    </p>
    <ComponentUsageExample description="">
      <CardHeader
        name="Testipysäkki"
        description="Testipysäkki 2"
        code="7528"
        icons={exampleIcons}
      />
    </ComponentUsageExample>
  </div>);

CardHeader.propTypes = {
  className: React.PropTypes.string,
  headingStyle: React.PropTypes.string,
  name: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  code: React.PropTypes.string,
  icon: React.PropTypes.string,
  icons: React.PropTypes.array,
  children: React.PropTypes.node,
};

export default CardHeader;

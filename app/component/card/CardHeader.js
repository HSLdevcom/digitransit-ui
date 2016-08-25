import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import Favourite from '../favourites/Favourite';
import Icon from '../icon/icon';

const CardHeader = ({
  className,
  favourite,
  addFavourite,
  children,
  headingStyle,
  name,
  description,
  code,
  icon,
}) => (
  <div className={cx('card-header', className)}>
    {addFavourite ?
      <Favourite addFavourite={addFavourite} favourite={favourite} className="right" /> : null}
    {children}
    {icon ? (
      <div
        className="left"
        style={{ fontSize: 32, paddingRight: 10, height: 32 }}
      >
        <Icon img={icon} />
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

CardHeader.description = (
  <div>
    <p>
      {`Generic card header, which displays card name, description,\n
        favourite star and optional childs`}
    </p>
    <ComponentUsageExample description="">
      <CardHeader
        addFavourite={() => {}}
        name="Testipysäkki"
        description="Testipysäkki 2"
        code="7528"
      />
    </ComponentUsageExample>
  </div>);

CardHeader.propTypes = {
  addFavourite: React.PropTypes.func,
  className: React.PropTypes.string,
  favourite: React.PropTypes.bool,
  headingStyle: React.PropTypes.string,
  name: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  code: React.PropTypes.string,
  icon: React.PropTypes.string,
  children: React.PropTypes.node,
};

export default CardHeader;

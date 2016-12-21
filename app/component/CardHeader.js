import React from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import SplitBars from './SplitBars';
import Favourite from './Favourite';
import CardStopCode from './atom/CardStopCode';
import config from '../config';

const IconWrapper = styled.div`
  font-size: 32px;
  padding-right: 10px;
  height: 32px;
`;

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
      <IconWrapper>
        <Icon img={icon} />
      </IconWrapper>
    ) : null}
    <div className="card-header-wrapper">
      <span className={headingStyle || 'h4 link-color'}>
        {name}<span className="link-arrow"> ›</span>
      </span>
      <div className="card-sub-header">
        {code != null ? <CardStopCode>{code}</CardStopCode> : null}
        <p className="sub-header-h4">{description}</p>
      </div>
    </div>
    { icons ? (
      <SplitBars>{icons}</SplitBars>
    ) : null}
  </div>);

const exampleIcons = [<Favourite favourite={false} addFavourite={() => {}} />];

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
  icons: React.PropTypes.arrayOf(React.PropTypes.node),
  children: React.PropTypes.node,
};

export default CardHeader;

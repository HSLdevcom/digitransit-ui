import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';

const TrafficNowLink = ({ handleClick, href }) => {
  return (
    <a className="traffic-now__link" href={href} onClick={handleClick}>
      <div className="traffic-now__link__left-column">
        <Icon
          img="icon_info-filled"
          color="#007ac9"
          height={1.5}
          width={1.5}
          colorAsFillOnly={false}
        />
        <div className="traffic-now__link__left-column-body">
          <FormattedMessage
            id="traffic-now_link"
            defaultValue="Services now"
            tagName="h2"
          />
          <FormattedMessage
            id="traffic-now_link-description"
            defaultValue="See changes and disruptions"
            tagName="p"
          />
        </div>
      </div>
      <span className="traffic-now__link__caret">
        <Icon img="icon_arrow-collapse--right" color="#007ac9" />
      </span>
    </a>
  );
};

TrafficNowLink.propTypes = {
  handleClick: PropTypes.func.isRequired,
  href: PropTypes.string,
};

TrafficNowLink.defaultProps = {
  href: undefined,
};

export default TrafficNowLink;

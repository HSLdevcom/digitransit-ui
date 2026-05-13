import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import { TRAFFICNOW } from '../../util/path';
import Icon from '../Icon';

const TrafficNowLink = () => {
  return (
    <Link className="traffic-now__link" to={`/${TRAFFICNOW}`}>
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
    </Link>
  );
};

export default TrafficNowLink;

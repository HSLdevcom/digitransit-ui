import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import { TRAFFICNOW } from '../../util/path';
import Icon from '../Icon';
import { useConfigContext } from '../../configurations/ConfigContext';

const TrafficNowLink = () => {
  const config = useConfigContext();
  const themeColor = config.colors.primary;

  return (
    <Link className="traffic-now__link" to={`/${TRAFFICNOW}`}>
      <div className="traffic-now__link__left-column">
        <Icon
          img="icon_info-filled"
          color={themeColor}
          height={1.5}
          width={1.5}
        />
        <div className="traffic-now__link__left-column-body">
          <FormattedMessage
            id="traffic-now_link"
            defaultMessage="Services now"
            tagName="h2"
          />
          <FormattedMessage
            id="traffic-now_link-description"
            defaultMessage="See changes and disruptions"
            tagName="p"
          />
        </div>
      </div>
      <span className="traffic-now__link__caret">
        <Icon img="icon_arrow-collapse--right" color={themeColor} />
      </span>
    </Link>
  );
};

export default TrafficNowLink;

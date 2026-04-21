import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';

import Icon from './Icon';
import IconBackground from './icon/IconBackground';
import IconBadge from './icon/IconBadge';

const IconWithIcon = ({
  badgeFill,
  badgeText,
  badgeTextFill,
  className,
  color,
  id,
  img,
  subIcon,
  subIconClassName,
  subIconShape,
  omitViewBox,
  backgroundShape,
}) => {
  const intl = useIntl();
  return (
    <span id={id} className={className}>
      <span>
        <Icon
          color={color}
          img={img}
          omitViewBox={backgroundShape ? undefined : omitViewBox}
          foreground={
            (badgeFill || badgeText) && (
              <IconBadge
                badgeFill={badgeFill}
                badgeText={badgeText}
                badgeTextFill={badgeTextFill}
              />
            )
          }
          background={
            backgroundShape && (
              <IconBackground
                shape={backgroundShape}
                color={color || 'currentColor'}
              />
            )
          }
        />
      </span>
      {subIcon && (
        <span
          className={subIconClassName}
          title={intl.formatMessage({ id: 'disruption' })}
        >
          <Icon
            img={subIcon}
            omitViewBox={omitViewBox}
            background={subIconShape && <IconBackground shape={subIconShape} />}
          />
        </span>
      )}
    </span>
  );
};

IconWithIcon.displayName = 'IconWithIcon';

IconWithIcon.propTypes = {
  badgeFill: PropTypes.string,
  badgeText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  badgeTextFill: PropTypes.string,
  className: PropTypes.string,
  color: PropTypes.string,
  id: PropTypes.string,
  img: PropTypes.string.isRequired,
  subIcon: PropTypes.string,
  subIconClassName: PropTypes.string,
  subIconShape: PropTypes.string,
  omitViewBox: PropTypes.bool,
  backgroundShape: PropTypes.string,
};

IconWithIcon.defaultProps = {
  badgeFill: undefined,
  badgeText: undefined,
  badgeTextFill: undefined,
  className: '',
  id: '',
  subIcon: '',
  subIconClassName: '',
  subIconShape: undefined,
  color: undefined,
  omitViewBox: false,
  backgroundShape: undefined,
};

export default IconWithIcon;

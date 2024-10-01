import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import { configShape } from '../../util/shapes';
import Icon from '../Icon';

// eslint-disable-next-line no-unused-vars
const NaviStack = ({ notifications, handleRemove, show }, { intl, config }) => {
  const [removingIndex, setRemovingIndex] = useState(null);

  const handleRemoveClick = index => {
    setRemovingIndex(index);
    setTimeout(() => {
      handleRemove(index);
      setRemovingIndex(null);
    }, 500);
  };
  return (
    <div className={cx('info-stack', !show ? 'slide-out' : 'slide-in')}>
      {notifications.map((info, index) => (
        <div
          key={info.backgroundColor}
          style={{ backgroundColor: info.backgroundColor }}
          className={cx(
            'info-stack-item',
            removingIndex === index ? 'slide-out-right' : '',
          )}
        >
          <Icon
            img={info.iconId}
            height="1.2"
            width="1.2"
            className="info-icon"
            color={info.iconColor}
          />
          {info.content}
          <button
            type="button"
            className="info-close"
            onClick={() => handleRemoveClick(index)}
          >
            <Icon
              img="icon-icon_close"
              height="0.8"
              width="0.8"
              color={config.colors.primary}
            />
          </button>
        </div>
      ))}
    </div>
  );
};
NaviStack.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  show: PropTypes.bool.isRequired,
  handleRemove: PropTypes.func.isRequired,
};

NaviStack.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};
export default NaviStack;

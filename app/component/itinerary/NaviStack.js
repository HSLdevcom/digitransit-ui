import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import Icon from '../Icon';

// eslint-disable-next-line no-unused-vars
const NaviStack = ({ notifications, handleRemove, show }, { intl }) => {
  const [removingIndex, setRemovingIndex] = useState(null);

  const handleRemoveClick = index => {
    setRemovingIndex(index);
    setTimeout(() => {
      handleRemove(index);
      setRemovingIndex(null);
    }, 500); // Duration of the slide-out-right animation
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
            height={1}
            width={1}
            className="info-icon"
            color={info.iconColor}
          />
          {info.content}
          <button
            type="button"
            className="info-close"
            onClick={() => handleRemoveClick(index)}
          >
            <Icon img="icon-icon_close" color="blue" />
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
};
export default NaviStack;

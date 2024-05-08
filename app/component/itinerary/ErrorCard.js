import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { childrenShape } from '../../util/shapes';
import Icon from '../Icon';

export const ICON_CAUTION = 'icon-icon_caution';
export const ICON_INFO = 'icon-icon_info';
export const ICON_TYPE_CAUTION = 'caution';
export const ICON_TYPE_INFO = 'info';

const Title = ({ msgId }) => (
  <div className="in-the-past">
    <FormattedMessage id={msgId} defaultMessage="" />
  </div>
);
Title.propTypes = {
  msgId: PropTypes.string.isRequired,
};
const ErrorCard = ({
  msgId,
  titleId,
  iconImg,
  iconType = ICON_TYPE_CAUTION,
  children,
}) => {
  const background = iconImg.replace('icon-icon_', '');

  return (
    <div className="summary-list-container summary-no-route-found">
      <div
        className={cx('flex-horizontal', 'summary-notification', background)}
      >
        <Icon
          className={cx('no-route-icon', iconType)}
          img={iconImg}
          color={iconImg === ICON_INFO ? '#0074be' : null}
        />
        <div>
          {titleId && <Title msgId={titleId} />}
          {msgId && (
            <FormattedMessage
              id={msgId}
              defaultMessage={
                'Unfortunately no routes were found for your journey. ' +
                'Please change your origin or destination address.'
              }
            />
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

ErrorCard.propTypes = {
  msgId: PropTypes.string,
  titleId: PropTypes.string,
  iconImg: PropTypes.string,
  iconType: PropTypes.string,
  children: childrenShape,
};

ErrorCard.defaultProps = {
  msgId: null,
  titleId: null,
  iconImg: ICON_CAUTION,
  iconType: ICON_TYPE_CAUTION,
  children: [],
};

export default ErrorCard;

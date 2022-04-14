import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import GenericTable from './GenericTable';
import Icon from './Icon';

const FavouriteIconTable = ({
  favouriteIconIds,
  selectedIconId,
  handleClick,
}) => {
  const columns = favouriteIconIds.map(value => (
    <button
      type="button"
      key={value}
      className={cx('favourite-icon-table-column', {
        'selected-icon': value === selectedIconId,
      })}
      onClick={() => handleClick(value)}
    >
      <Icon img={value} height={1.125} width={1.125} />
    </button>
  ));

  return <GenericTable showLabels={false}>{columns}</GenericTable>;
};

FavouriteIconTable.displayName = 'FavouriteIconTable';

FavouriteIconTable.propTypes = {
  handleClick: PropTypes.func.isRequired,
  favouriteIconIds: PropTypes.array,
  selectedIconId: PropTypes.string,
};

export default FavouriteIconTable;

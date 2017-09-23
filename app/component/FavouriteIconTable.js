import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';
import GenericTable from './GenericTable';
import Icon from './Icon';

const FavouriteIconTable = ({
  favouriteIconIds,
  selectedIconId,
  handleClick,
}) => {
  const columns = favouriteIconIds.map(value => (
    <button
      key={value}
      className={cx('favourite-icon-table-column', {
        'selected-icon': value === selectedIconId,
      })}
      onClick={() => handleClick(value)}
    >
      <Icon img={value} />
    </button>
  ));

  return <GenericTable showLabels={false}>{columns}</GenericTable>;
};

FavouriteIconTable.displayName = 'FavouriteIconTable';

FavouriteIconTable.description = () => (
  <div>
    <p>Renders a score table</p>
    <ComponentUsageExample description="">
      <FavouriteIconTable handleClick={() => {}} />
    </ComponentUsageExample>
  </div>
);

FavouriteIconTable.propTypes = {
  handleClick: PropTypes.func.isRequired,
  favouriteIconIds: PropTypes.array,
  selectedIconId: PropTypes.string,
};

export default FavouriteIconTable;

import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import GenericTable from '../util/table/generic-table';
import Icon from '../icon/icon';

const FavouriteIconTable = ({ favouriteIconIds, selectedIconId, handleClick }) => {
  const columnWidth = {
    width: `${100 / favouriteIconIds.length}%`,
  };

  const columns = favouriteIconIds.map((value, index) =>
    (<div
      key={index} className={cx('favourite-icon-table-column', {
        'selected-icon': value === selectedIconId,
      })} style={columnWidth} onClick={() => handleClick(value)}
    ><Icon img={value} /></div>)
  );

  return <GenericTable showLabels={false}>{columns}</GenericTable>;
};

FavouriteIconTable.displayName = 'FavouriteIconTable';

FavouriteIconTable.description =
  (<div>
    <p>Renders a score table</p>
    <ComponentUsageExample description="">
      <FavouriteIconTable handleClick={() => {}} />
    </ComponentUsageExample>
  </div>);

FavouriteIconTable.propTypes = {
  handleClick: React.PropTypes.func.isRequired,
  favouriteIconIds: React.PropTypes.array,
  selectedIconId: React.PropTypes.string,
};

export default FavouriteIconTable;

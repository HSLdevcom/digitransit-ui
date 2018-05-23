import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import withBreakpoint from '../util/withBreakpoint';

function DeparturesTable({ headers, content, breakpoint }) {
  return (
    <div
      className={cx('nearby-table-container', {
        mobile: breakpoint !== 'large',
      })}
    >
      <table className="nearby-departures-table">
        <thead>
          <tr className="header-tr">
            {headers.map(o => (
              <th key={`${o.id}-${o.defaultMessage}`} className={`th-${o.id}`}>
                <FormattedMessage id={o.id} defaultMessage={o.defaultMessage} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{content}</tbody>
      </table>
    </div>
  );
}

DeparturesTable.propTypes = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      defaultMessage: PropTypes.string.isRequired,
    }),
  ).isRequired,
  content: PropTypes.arrayOf(PropTypes.element).isRequired,
  breakpoint: PropTypes.string.isRequired,
};

export default withBreakpoint(DeparturesTable);
